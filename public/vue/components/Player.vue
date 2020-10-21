<template>
  <div class="navbar-player">
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
      <div v-if="player.radio" class="player-name" v-bind:title="showTitle">
        {{ player.radio.name }}
      </div>
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

import { DateTime } from 'luxon';

import VolumeFader from './VolumeFader.vue';
import * as config from '../config/config';

export default {
  components: {
    VolumeFader
  },
  data() {
    return {
      audio: null,
      hls: null,
      /*
        As the volume icon may be shown instead of the mute icon on tablets and a click event
        also triggers a mouseover event before it, we avoid showing the volume fader if a mouseover
        is immediately followed by a click
      */
      debounce: false,
      lastUpdated: null,
      checkTimer: null
    };
  },
  mounted() {
    window.togglePlaybackStatus = this.togglePlay;
  },
  beforeDestroy() {
    clearInterval(this.checkTimer);
  },
  computed: {
    ...mapState({
      player: state => state.player,
      streamFavorites: state => state.streams.favorites
    }),
    ...mapGetters([
      'displayVolume'
    ]),
    isFavorite() {
      if (this.player.radio === null) {
        return false;
      }

      // radio
      if (this.player.radio.type === 'radio') {
        return this.player.radio.collection.indexOf(config.COLLECTION_FAVORITES) !== -1;
      }

      // stream
      return this.streamFavorites.indexOf(this.player.radio.code_name) !== -1;
    },
    showTitle() {
      if (this.player.show === null) {
        return '';
      }

      const start = DateTime.fromSQL(this.player.show.start_at)
        .setZone(config.TIMEZONE).toLocaleString(DateTime.TIME_SIMPLE);
      const end = DateTime.fromSQL(this.player.show.end_at)
        .setZone(config.TIMEZONE).toLocaleString(DateTime.TIME_SIMPLE);

      return `${this.player.show.title} - ${start}-${end}`;
    },
    favoriteTitle() {
      return (this.player.radio !== null
      && this.isFavorite === true
        ? this.$i18n.tc('message.player.favorites.remove') : this.$i18n.tc('message.player.favorites.add'));
    }
  },
  /* eslint-disable func-names */
  watch: {
    'player.playing': function (val) {
      if (this.player.externalPlayer === true) { return; }

      if (val === true) {
        this.play(this.player.radio.stream_url);
      } else {
        this.stop();
      }
    },
    'player.muted': function (val) {
      if (this.player.externalPlayer === true) { return; }

      if (this.audio !== null) {
        this.audio.muted = val;
      }
    },
    'player.volume': function (val) {
      if (this.player.externalPlayer === true) { return; }

      if (this.audio !== null) {
        this.audio.volume = (val * 0.1);
      }
    },
  },
  methods: {
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
      this.$gtag.event(config.GTAG_ACTION_TOGGLE_PLAY, {
        event_category: config.GTAG_CATEGORY_PLAYER,
        value: config.GTAG_ACTION_TOGGLE_PLAY_VALUE
      });

      this.$store.dispatch('togglePlay');
    },
    /* eslint-disable no-undef */
    play(url) {
      if (url.indexOf('.m3u8') !== -1) {
        if (Hls.isSupported()) {
          this.audio = document.getElementById('videoplayer');
          this.hls = new Hls();
          // bind them together
          this.hls.attachMedia(this.audio);
          this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
            this.hls.loadSource(url);
            this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
              this.audio.muted = this.player.muted;
              this.audio.volume = (this.player.volume * 0.1);
              this.audio.play();
            });
          });
        }
      } else {
        const streamUrl = (url.substring(0, 5) !== 'https')
          ? `${streamsProxy}?stream=${url}` : url;

        // this.audio = new Audio(`${stream_url}?cb=${new Date().getTime()}`);
        this.audio = new Audio(`${streamUrl}`);
        this.audio.muted = this.player.muted;
        this.audio.volume = (this.player.volume * 0.1);
        this.audio.play();
      }

      // check if stream playing
      this.audio.addEventListener('timeupdate', () => {
        this.lastUpdated = new Date();
      });

      this.checkTimer = setInterval(this.check, config.PLAYER_TYPE_CHECK_INTERVAL);

      this.lastUpdated = new Date();
    },
    check() {
      const now = new Date();
      if (now - this.lastUpdated > config.PLAYER_TYPE_CHECK_TIMEOUT) {
        this.lastUpdated = null;
        this.$store.dispatch('stop');
        clearInterval(this.checkTimer);
      }
    },
    stop() {
      clearInterval(this.checkTimer);
      this.audio.pause();
      if (this.hls !== null) {
        this.hls.destroy();
        this.hls = null;
      }
      delete this.audio;
      this.audio = null;
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
