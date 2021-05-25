<template>
  <div class="navbar-player">
    <div v-if="this.player.radio" class="player-radio-link">
      <a :href="radioLink()"><span class="glyphicon glyphicon-share"></span></a>
    </div>
    <transition name="timer-fade" mode="out-in">
      <timer v-if="displayTimer"></timer>
    </transition>
    <div class="player-wrap">
      <div class="player-sound player-sound-mute"
           v-on:click="toggleMute" v-if="!player.externalPlayer">
        <span class="glyphicon glyphicon-volume-off" aria-hidden="true"
              :class="{ 'player-muted': player.muted }"></span>
      </div>
      <div class="player-sound player-sound-fader"
           v-if="!player.externalPlayer"
           v-on:mouseover="volumeFocus(true)"
           v-on:mouseleave="volumeFocus(false)"
           v-on:click.stop="toggleMute">
        <span class="glyphicon"
          :class="{
            'glyphicon-volume-off': player.muted || player.focus.icon,
            'player-muted': player.muted,
            'glyphicon-volume-up': !(player.muted || player.focus.icon) && player.volume > 4,
            'glyphicon-volume-down': !(player.muted || player.focus.icon) && player.volume <= 4
          }"
          aria-hidden="true"></span>
      </div>
      <div class="player-playpause" v-on:click="togglePlay"
        :class="{ 'player-playpause-disabled': player.radio === null }">
        <span class="glyphicon icon-round"
          :class="{ 'glyphicon-play': !player.playing, 'glyphicon-pause': player.playing }"
          aria-hidden="true"></span>
      </div>
      <player-info v-if="player.radio"></player-info>
      <div v-if="!player.radio" class="player-name player-name-help">
        {{ $t('message.player.placeholder') }}
      </div>
      <div class="player-favorite"
           v-if="player.radio"
           v-on:click="toggleFavorite"
           :title="favoriteTitle"
           :class="{ 'player-favorite-added': isFavorite }">
      </div>
    </div>
    <volume-fader v-if="displayVolume"/>
    <video id="videoplayer" style="display:none"></video>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

import { Socket } from '../../../js/phoenix';

import PlayerInfo from './PlayerInfo.vue';
import Timer from './Timer.vue';
import VolumeFader from './VolumeFader.vue';
import * as config from '../../config/config';
import AndroidApi from '../../api/AndroidApi';
import PlayerUtils from '../../utils/PlayerUtils';

export default {
  components: {
    PlayerInfo,
    Timer,
    VolumeFader
  },
  data() {
    return {
      audio: null,
      hls: null,
      socket: null,
      channel: null,
      /*
        As the volume icon may be shown instead of the mute icon on tablets and a click event
        also triggers a mouseover event before it, we avoid showing the volume fader if a mouseover
        is immediately followed by a click
      */
      debounce: false,
      lastUpdated: null,
      checkTimer: null,
      locale: this.$i18n.locale,
    };
  },
  mounted() {
    // window.togglePlaybackStatus = this.togglePlay;
    // we refresh the state if the app is running
    if (this.player.externalPlayer === true) {
      AndroidApi.getState();
    }
  },
  created() {
    window.addEventListener('beforeunload', this.beforeWindowUnload);
  },
  beforeDestroy() {
    clearInterval(this.checkTimer);
  },
  computed: {
    ...mapState({
      player: state => state.player,
      collections: state => state.schedule.collections,
      streamFavorites: state => state.streams.favorites
    }),
    ...mapGetters([
      'displayVolume',
      'streamUrl'
    ]),
    isFavorite() {
      if (this.player.radio === null) {
        return false;
      }

      // radio
      if (this.player.radio.type === config.PLAYER_TYPE_RADIO) {
        return this.$store.getters.isFavorite(this.player.radio.code_name);
      }

      // stream
      return this.streamFavorites.indexOf(this.player.radio.code_name) !== -1;
    },
    favoriteTitle() {
      return (this.player.radio !== null
      && this.isFavorite === true
        ? this.$i18n.tc('message.player.favorites.remove') : this.$i18n.tc('message.player.favorites.add'));
    },
    displayTimer() {
      if (this.player.externalPlayer === true
        && this.player.externalPlayerVersion < config.ANDROID_TIMER_MIN_VERSION) {
        return false;
      }

      return this.player.playing || this.player.timer > 0;
    },
    /* used to watch multiple properties at once (will not be necessary in Vue3) */
    radioShowWatching() {
      const radio = this.player.radio !== null ? this.player.radio.code_name : 'null';
      const show = this.player.show !== null ? this.player.show.hash : 'null';
      return `${this.player.playing}|${radio}|${show}`;
    }
  },
  /* eslint-disable func-names */
  /* eslint-disable no-undef */
  watch: {
    'player.playing': function (val) {
      const cleanSocket = () => {
        this.socket.disconnect();
        this.channel = null;
        this.socket = null;
        this.$store.dispatch('setSong', null);
      };

      if (val === true) {
        let channelName = null;

        if ((this.player.radio.type === config.PLAYER_TYPE_RADIO
            && this.player.radio.streams[this.player.radioStreamCodeName].current_song === true)
            || (this.player.radio.type === config.PLAYER_TYPE_STREAM
            && this.player.radio.current_song === true)) {
          const channelNameEnd = this.player.radio.type === config.PLAYER_TYPE_RADIO
            ? this.player.radioStreamCodeName : this.player.radio.radio_code_name;
          channelName = `song:${channelNameEnd}`;
        } else {
          channelName = `url:${this.streamUrl}`;
        }

        this.socket = new Socket(`wss://${apiUrl}/socket`);
        this.socket.connect();
        this.socket.onError(() => {
          this.$store.dispatch('setSong', null);
        });

        this.channel = this.socket.channel(channelName);

        this.channel.on('playing', (song) => {
          this.$store.dispatch('setSong', song);
        });

        this.channel.on('quit', () => {
          cleanSocket();
        });

        this.channel.join()
          // .receive('ok', ({ messages }) => console.log('catching up', messages))
          .receive('error', () => {
            cleanSocket();
          })
          .receive('timeout', () => {
            cleanSocket();
          });
      } else if (this.socket !== null) {
        cleanSocket();
      }

      if (this.player.externalPlayer === true) { return; }

      if (val === true) {
        this.play(this.streamUrl);
      } else {
        this.stop();
      }
    },
    'player.muted': function (val) {
      if (this.player.externalPlayer === true) { return; }

      if (window.audio !== undefined && window.audio !== null) {
        window.audio.muted = val;
      }
    },
    'player.volume': function (val) {
      if (this.player.externalPlayer === true) { return; }

      if (window.audio !== undefined && window.audio !== null) {
        window.audio.volume = (val * 0.1);
      }
    },
    /* eslint-disable object-shorthand */
    radioShowWatching: function (newVal, oldVal) {
      if (this.player.externalPlayer === true || this.player.playing === false) { return; }

      let display = false;
      const [oldPlaying, oldRadio, oldShow] = oldVal.split('|');
      /* eslint-disable no-unused-vars */
      const [newPlaying, newRadio, newShow] = newVal.split('|');

      if (newRadio === 'null') {
        return;
      }

      if (oldRadio === newRadio && oldPlaying === 'false') {
        display = true;
      } else if (oldRadio !== newRadio) {
        display = true;
      } else if (oldRadio === newRadio && oldShow !== newShow && newShow !== 'null') {
        display = true;
      }

      if (display === true) {
        PlayerUtils.showNotification(this.player.radio,
          this.player.radioStreamCodeName, this.player.show);
      }
    }
  },
  methods: {
    beforeWindowUnload() {
      if (this.player.externalPlayer === false && this.player.playing === true) {
        this.$store.dispatch('stop');
      }
    },
    radioLink() {
      if (this.player.radio === null) {
        return '#';
      }

      if (this.player.radio.type === 'radio') {
        return `/${this.locale}/#/radio/${this.player.radio.code_name}`;
      }

      return `/${this.locale}/#/streaming/${this.player.radio.code_name}`;
    },
    toggleMute() {
      this.$store.dispatch('toggleMute');

      this.debounce = true;
      setTimeout(
        () => {
          this.debounce = false;
        },
        300
      );
    },
    togglePlay() {
      if (this.player.externalPlayer === false) {
        this.$gtag.event(config.GTAG_ACTION_TOGGLE_PLAY, {
          event_category: config.GTAG_CATEGORY_PLAYER,
          event_label: this.player.radio.code_name,
          value: config.GTAG_ACTION_TOGGLE_PLAY_VALUE
        });
      }

      this.$store.dispatch('togglePlay');
    },
    /* eslint-disable no-undef */
    play(url) {
      this.stop();
      let startPlayPromise;

      if (url.indexOf('.m3u8') !== -1) {
        if (Hls.isSupported()) {
          window.audio = document.getElementById('videoplayer');
          this.hls = new Hls();
          // bind them together
          this.hls.attachMedia(window.audio);
          this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
            this.hls.loadSource(url);
            this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
              window.audio.muted = this.player.muted;
              window.audio.volume = (this.player.volume * 0.1);
              startPlayPromise = window.audio.play();
            });
          });
        }
      } else {
        const streamUrl = (url.substring(0, 5) !== 'https')
          ? `${streamsProxy}?stream=${url}` : url;

        window.audio = new Audio(`${streamUrl}`);
        window.audio.muted = this.player.muted;
        window.audio.volume = (this.player.volume * 0.1);
        startPlayPromise = window.audio.play();
      }

      if (startPlayPromise !== undefined) {
        startPlayPromise.then(() => {
          // check if stream playing
          window.audio.addEventListener('timeupdate', () => {
            this.lastUpdated = new Date();
          });

          this.checkTimer = setInterval(this.check, config.PLAYER_TYPE_CHECK_INTERVAL);

          this.lastUpdated = new Date();
        }).catch((error) => {
          this.$store.dispatch('stop');

          if (error.name === 'NotAllowedError') {
            this.$store.dispatch('toast', { message: this.$i18n.tc('message.player.autoplay_error') });
          } else {
            this.$store.dispatch('toast', { message: this.$i18n.tc('message.player.play_error') });
          }
        });
      }
    },
    // may be dead code due to new player promise handling
    check() {
      const now = new Date();
      if (now - this.lastUpdated > config.PLAYER_TYPE_CHECK_TIMEOUT) {
        this.lastUpdated = null;
        this.$store.dispatch('stop');
        clearInterval(this.checkTimer);
        this.$store.dispatch('toast', { message: this.$i18n.tc('message.player.play_error') });
      }
    },
    stop() {
      clearInterval(this.checkTimer);

      if (window.audio !== undefined && window.audio !== null) {
        window.audio.pause();
      }

      if (this.hls !== null) {
        this.hls.destroy();
        this.hls = null;
      }
      window.audio = null;
      delete window.audio;
    },
    toggleFavorite() {
      if (this.player.radio !== null) {
        this.$gtag.event(config.GTAG_ACTION_FAVORITE_TOGGLE, {
          event_category: config.GTAG_CATEGORY_SCHEDULE,
          event_label: this.player.radio.code_name,
          value: config.GTAG_ACTION_FAVORITE_TOGGLE_VALUE
        });

        this.$store.dispatch('toggleFavorite', this.player.radio);
      }
    },
    volumeFocus(status) {
      setTimeout(
        () => {
          if (this.debounce === false) {
            this.$store.dispatch('volumeFocus', { element: 'icon', status });
          }
        },
        200
      );
    }
  }
};
</script>
