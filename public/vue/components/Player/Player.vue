<template>
  <div class="navbar-player">
    <div v-if="radio && !prevRadio" class="player-radio-link">
      <a :href="radioLink()"><i class="bi bi-link-45deg"></i></a>
    </div>
    <transition name="play-prev-fade" mode="out-in">
      <div v-if="prevRadio" class="player-radio-previous"
           v-on:click="togglePrevious"
           :title="$i18n.t('message.player.previous', { radio: prevRadio.name })">
        <i class="bi-arrow-left-right"></i>
      </div>
    </transition>
    <transition name="timer-fade" mode="out-in">
      <timer v-if="timerDisplay"></timer>
    </transition>
    <div class="player-wrap">
      <div class="player-sound player-sound-fader"
           v-if="!externalPlayer"
           v-on:mouseover="volumeFocus(true)"
           v-on:mouseleave="volumeFocus(false)"
           v-on:click.stop="toggleMute">
        <i class="bi"
           :class="{
            'bi-volume-mute-fill': muted || focus.icon,
            'player-muted': muted,
            'bi-volume-up-fill': !(muted || focus.icon) && volume > 4,
            'bi-volume-down-fill': !(muted || focus.icon) && volume <= 4
          }"></i>
      </div>
      <div class="player-playpause" v-on:click="togglePlay"
           :class="{ 'player-playpause-disabled': radio === null }">
        <i
          v-if="playing !== PlayerStatus.Loading"
          class="bi"
          :class="{
            'bi-play-circle': playing === PlayerStatus.Stopped,
            'bi-pause-circle': playing !== PlayerStatus.Stopped
          }"></i>
        <div
          v-if="playing === PlayerStatus.Loading"
          class="spinner-border spinner-border-sm" role="status"
            style="width: 1em; height: 1em;">
          <span class="visually-hidden">Loading....</span>
        </div>
      </div>
      <player-info v-if="radio"></player-info>
      <transition name="timer-fade" mode="out-in">
        <div v-if="userLogged && currentSong" class="player-add-song">
          <player-save-song></player-save-song>
        </div>
      </transition>
      <div v-if="!radio" class="player-name player-name-help">
        {{ $t('message.player.placeholder') }}
      </div>
      <div class="player-favorite"
           v-if="radio"
           v-on:click="favoriteToggle"
           :title="favoriteTitle"
           :class="{ 'player-favorite-added': isFavorite }">
        <i class="bi"
           :class="{
        'bi-heart-fill': isFavorite,
        'bi-heart': !isFavorite
        }"></i>
      </div>
    </div>
    <volume-fader v-if="displayVolume"/>
    <audio id="videoplayer1" style="display:none"></audio>
    <audio id="videoplayer2" style="display:none"></audio>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapActions } from 'pinia';

/* eslint-disable import/no-cycle */
import { useGlobalStore } from '@/stores/globalStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useScheduleStore } from '@/stores/scheduleStore';
import { useStreamsStore } from '@/stores/streamsStore';
import { useUserStore } from '@/stores/userStore';

import PlayerStatus from '@/types/player_status';
import type { PlayOptions } from '@/types/play_options';

import PlayerInfo from './PlayerInfo.vue';
import PlayerSaveSong from './PlayerSaveSong.vue';
import Timer from '../Timer/Timer.vue';
import VolumeFader from './VolumeFader.vue';

import * as config from '../../config/config';
import AndroidApi from '../../api/AndroidApi';
import PlayerUtils from '../../utils/PlayerUtils';
import tooltip from '../../utils/tooltip';
import typeUtils from '../../utils/typeUtils';
/* eslint-disable import/extensions */
import type Hls from '../../../js/hls.js';

/* we load the hls script dynamically once, reducing initial app load */
/* eslint-disable arrow-body-style */
const loadHls = () => {
  return new Promise((resolve, reject) => {
    const hlsElem = document.getElementById('hls-script');
    if (hlsElem !== null) {
      resolve(true);
      return;
    }

    const hlsScript = document.createElement('script');
    hlsScript.type = 'text/javascript';
    hlsScript.id = 'hls-script';
    hlsScript.src = '/js/hls.min.js';
    hlsScript.onload = resolve;
    hlsScript.onerror = reject;
    document.body.appendChild(hlsScript);
  });
};

/* we load the dash script dynamically once, reducing initial app load */
/* eslint-disable arrow-body-style */
const loadDash = () => {
  return new Promise((resolve, reject) => {
    const dashElem = document.getElementById('dash-script');
    if (dashElem !== null) {
      resolve(true);
      return;
    }

    const dashScript = document.createElement('script');
    dashScript.type = 'text/javascript';
    dashScript.id = 'dash-script';
    dashScript.src = '/js/dash.all.min.js';
    dashScript.onload = resolve;
    dashScript.onerror = reject;
    document.body.appendChild(dashScript);
  });
};

interface PlayerRadio {
  id: 1|2,
  url: string|null
  timer: number|null
  hls: Hls|null
  dash: any|null
  elementId: string,
  element: HTMLElement|null
  startedAt: Date|null
}

interface PlayerAudio {
  current: 1|2|null
  player1: PlayerRadio
  player2: PlayerRadio
}

export default defineComponent({
  components: {
    PlayerInfo,
    PlayerSaveSong,
    Timer,
    VolumeFader
  },
  /* eslint-disable indent */
  data(): {
    PlayerStatus: any,
    audio: PlayerAudio,
    hls: Hls|null,
    // dash: Dash|null,
    debounce: boolean,
    locale: string
  } {
    return {
      PlayerStatus,
      audio: {
        current: null,
        player1: {
          id: 1,
          url: null,
          timer: null,
          hls: null,
          dash: null,
          elementId: 'videoplayer1',
          element: null,
          startedAt: null
        },
        player2: {
          id: 2,
          url: null,
          timer: null,
          hls: null,
          dash: null,
          elementId: 'videoplayer2',
          element: null,
          startedAt: null
        }
      },
      /*
        As the volume icon may be shown instead of the mute icon on tablets and a click event
        also triggers a mouseover event before it, we avoid showing the volume fader if a mouseover
        is immediately followed by a click
      */
      debounce: false,
      hls: null,
      // dash: null,
      locale: this.$i18n.locale,
    };
  },
  mounted() {
    // we refresh the state if the app is running
    if (this.externalPlayer === true) {
      AndroidApi.getState();
      // @ts-ignore
    } else if (window.navigator.connection !== undefined) {
      // @ts-ignore
      window.navigator.connection.onchange = this.updateFlux();
    }
  },
  created() {
    window.addEventListener('beforeunload', this.beforeWindowUnload);
  },
  computed: {
    ...mapState(useScheduleStore, { isRadioFavorite: 'isFavorite', collection: 'collections' }),
    ...mapState(useStreamsStore, { streamFavorites: 'favorites' }),
    ...mapState(useUserStore, {
      userLogged: 'logged'
    }),
    ...mapState(usePlayerStore, [
      'flux',
      'focus',
      'timer',
      'displayVolume',
      'streamUrl',
      'timerDisplay',
      'timerIsActive',
      'radio',
      'show',
      'prevRadio',
      'externalPlayer',
      'radioStreamCodeName',
      'playing',
      'muted',
      'volume',
      'currentSong'
    ]),
    currentPlayer(): any|null {
      if (this.audio.current === null) {
        return null;
      }

      return this.audio[`player${this.audio.current}`];
    },
    isFavorite(store: any): boolean {
      // (I don't remember where that store argument comes from and why it works)
      if (this.radio === null) {
        return false;
      }

      // radio
      if (typeUtils.isRadio(this.radio)) {
        return store.isRadioFavorite(this.radio.code_name);
      }

      // stream
      return this.streamFavorites.indexOf(this.radio.code_name) !== -1;
    },
    favoriteTitle(): string {
      return (this.radio !== null
      && this.isFavorite === true
          ? (this.$i18n as any).tc('message.player.favorites.remove')
          : (this.$i18n as any).tc('message.player.favorites.add'));
    },
    /* used to watch multiple properties at once (will not be necessary in Vue3) */
    /* todo revisit now that we use Vue 3 */
    radioShowWatching(): string {
      const radio = this.radio !== null ? this.radio.code_name : 'null';
      const show = this.show !== null ? this.show.hash : 'null';
      return `${this.playing}|${radio}|${show}`;
    }
  },
  methods: {
    ...mapActions(useGlobalStore, ['displayToast']),
    ...mapActions(useUserStore, ['toggleFavorite']),
    ...mapActions(usePlayerStore, {
      togglePreviousDispatch: 'togglePrevious',
      toggleMuteDispatch: 'toggleMute',
      togglePlayDispatch: 'togglePlay',
      stopDispatch: 'stop',
      volumeFocusDispatch: 'volumeFocus',
      joinChannel: 'joinChannel',
      updateFlux: 'updateFlux',
      playError: 'playError',
      setPlayerStatus: 'setPlayerStatus',
      setStreamPlayingError: 'setStreamPlayingError'
    }),
    beforeWindowUnload() {
      if (this.externalPlayer === false && this.playing !== PlayerStatus.Stopped) {
        this.stop();
      }
    },
    radioLink(): string {
      if (this.radio === null) {
        return '#';
      }

      if (this.radio.type === 'radio') {
        return `/${this.locale}/radio/${this.radio.code_name}`;
      }

      return `/${this.locale}/streaming/${this.radio.code_name}`;
    },
    toggleMute() {
      this.toggleMuteDispatch();

      this.debounce = true;
      setTimeout(
          () => {
            this.debounce = false;
          },
          300
      );
    },
    togglePlay() {
      if (this.externalPlayer === false) {
        (this as any).$gtag.event(config.GTAG_ACTION_TOGGLE_PLAY, {
          event_category: config.GTAG_CATEGORY_PLAYER,
          event_label: this.radio !== null ? this.radio!.code_name : null,
          value: config.GTAG_ACTION_TOGGLE_PLAY_VALUE
        });
      }

      this.togglePlayDispatch();
    },
    /* eslint-disable no-undef */
    play(url: string, options?: PlayOptions) {
      // this.stop();
      // if (this.playerStore.playing === true) {
      //   this.pause();
      // } else {
      // this stream was the previously paused one
      if (this.currentPlayer !== null && this.currentPlayer.url === url) {
        if (this.currentPlayer.timer !== null) {
          clearTimeout(this.currentPlayer.timer);
          this.currentPlayer.timer = null;
        }
        this.currentPlayer.element.volume = (this.volume * 0.1);
        this.playingStarted(this.currentPlayer);
        return;
      }
      // }

      let startPlayPromise;
      this.setNextPlayer(url);

      if (this.currentPlayer.timer !== null) {
        clearTimeout(this.currentPlayer.timer);
        this.currentPlayer.timer = null;
      }

      // previous stream is the same as this one
      if (this.currentPlayer.url === url) {
        this.currentPlayer.element.volume = (this.volume * 0.1);
        this.playingStarted(this.currentPlayer);
        return;
      }

      this.currentPlayer.startedAt = Date.now();
      this.currentPlayer.url = url;

      if (url.indexOf('.m3u8') !== -1 || (options && options.force_hls)) {
        loadHls().then(() => {
          // @ts-ignore
          if (Hls.isSupported()) {
            this.currentPlayer.element = document.getElementById(this.currentPlayer.elementId);
            // @ts-ignore
            this.currentPlayer.hls = new Hls();
            // bind them together
            this.currentPlayer.hls.attachMedia(this.currentPlayer.element);

            // @ts-ignore
            this.currentPlayer.hls.on(Hls.Events.ERROR, (event, data) => {
              if (this.currentPlayer.id !== this.audio.current) {
                return;
              }

              if (data.fatal) {
                this.displayToast({
                  message: (this.$i18n as any).tc('message.player.play_error'),
                  type: 'error'
                });

                this.playError();

                if (this.radio && this.radio.type === config.PLAYER_TYPE_STREAM) {
                  this.setStreamPlayingError(this.radio.code_name);
                }
              }
            });

            // @ts-ignore
            /*
            this.currentPlayer.hls.on(Hls.Events.FRAG_PARSING_METADATA, (event, data) => {
              if (data) {
                console.log("Data", data);
              } else {
                console.log('no data');
              }
            });
             */

            // @ts-ignore
            this.currentPlayer.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
              this.currentPlayer.hls.loadSource(url);
              // @ts-ignore
              this.currentPlayer.hls.on(Hls.Events.MANIFEST_PARSED, () => {
                this.currentPlayer.element.muted = this.muted;
                this.currentPlayer.element.volume = (this.volume * 0.1);
                startPlayPromise = this.currentPlayer.element.play();
                this.playingStarted(this.currentPlayer);
              });
            });
          }
        });
      } else if (url.indexOf('.mpd') !== -1 || (options && options.force_mpd)) {
        loadDash().then(() => {
          this.currentPlayer.element = document.getElementById(this.currentPlayer.elementId);
          // @ts-ignore
          this.currentPlayer.dash = dashjs.MediaPlayer().create();
          this.currentPlayer.dash.initialize(this.currentPlayer.element, url, false);

          this.currentPlayer.dash.on('error', () => {
            if (this.currentPlayer.id !== this.audio.current) {
              return;
            }

            this.displayToast({
              message: (this.$i18n as any).tc('message.player.play_error'),
              type: 'error'
            });

            this.playError();

            if (this.radio && this.radio.type === config.PLAYER_TYPE_STREAM) {
              this.setStreamPlayingError(this.radio.code_name);
            }
          });

          this.currentPlayer.dash.on('canPlay', () => {
            if (this.currentPlayer.id !== this.audio.current) {
              this.currentPlayer.element.muted = this.muted;
              this.currentPlayer.element.volume = (this.volume * 0.1);
            }

            startPlayPromise = this.currentPlayer.element.play();
            this.playingStarted(this.currentPlayer);
          });
        });
      } else {
        const streamUrl = (url.substring(0, 5) !== 'https')
            /* eslint-disable no-undef */
            // @ts-expect-error apiUrl is defined on the global scope
            ? `${streamsProxy}?k=${streamsProxyKey}&stream=${url}` : url;

        this.currentPlayer.element = new Audio(streamUrl);
        this.currentPlayer.element.muted = this.muted;
        this.currentPlayer.element.volume = (this.volume * 0.1);
        startPlayPromise = this.currentPlayer.element.play();
      }

      if (startPlayPromise !== undefined) {
        startPlayPromise.then(() => {
          this.playingStarted(this.currentPlayer);
        }).catch((error: any) => {
          if (this.currentPlayer.id !== this.audio.current) {
            return;
          }

          this.setPlayerStatus(PlayerStatus.Stopped);
          this.stop();

          if (error.name === 'NotAllowedError') {
            this.displayToast({
              message: (this.$i18n as any).tc('message.player.autoplay_error'),
              type: 'error'
            });
          } else {
            this.displayToast({
              message: (this.$i18n as any).tc('message.player.play_error'),
              type: 'error'
            });

            this.playError();

            if (this.radio && this.radio.type === config.PLAYER_TYPE_STREAM) {
              this.setStreamPlayingError(this.radio.code_name);
            }
          }
        });
      }
    },
    pause() {
      if (this.currentPlayer === null) {
        return;
      }

     if (this.flux.allowTwoFeeds === false) {
        this.stop();
        return;
     }

      // allow quick real stop at stream' start
      if ((Date.now() - this.currentPlayer.startedAt) / 1000 <= config.PLAYER_MAX_SECONDS_TO_STOP) {
        this.stop();
        return;
      }
      if (this.currentPlayer.element !== undefined && this.currentPlayer.element !== null) {
        this.currentPlayer.element.volume = 0;

        this.currentPlayer.timer = setTimeout(
            this.resetPlayer,
            this.flux.delayBeforeStop,
            this.audio.current
        );
      }
    },
    stop() {
      if (this.currentPlayer === null) {
        return;
      }

      if (this.currentPlayer.element !== undefined && this.currentPlayer.element !== null) {
        this.currentPlayer.element.pause();
        this.currentPlayer.element.src = '';
      }

      if (this.currentPlayer.timer !== null) {
        clearTimeout(this.currentPlayer.timer);
      }

      if (this.currentPlayer.hls !== null) {
        this.currentPlayer.hls.destroy();
        this.currentPlayer.hls = null;
      }

      if (this.currentPlayer.dash !== null) {
        this.currentPlayer.dash.destroy();
        this.currentPlayer.dash = null;
      }

      this.currentPlayer.element = null;
      this.currentPlayer.url = null;
      this.currentPlayer.startedAt = null;

      // delete window.audio;
    },
    /* eslint-disable no-param-reassign */
    resetPlayer(playerNumber: number) {
      /// @ts-ignore
      const player = this.audio[`player${playerNumber}`];

      if (player === undefined || player === null) {
        return;
      }

      if (player.element !== undefined && player.element !== null) {
        player.element.pause();
        player.element.src = '';
      }

      if (player.timer !== null) {
        clearTimeout(player.timer);
        player.timer = null;
      }

      if (player.hls !== null) {
        player.hls.destroy();
        player.hls = null;
      }

      if (player.dash !== null) {
        player.dash.destroy();
        player.dash = null;
      }

      player.element = null;
      player.url = null;
      player.startedAt = null;
      // delete window.audio;
      // delete window.audio;
    },
    playingStarted(player: PlayerRadio) {
      if (player.id !== this.audio.current) {
        return;
      }

      this.setPlayerStatus(PlayerStatus.Playing);

      tooltip.set('player-timer', config.COOKIE_TOOLTIP_TIMER);
    },
    favoriteToggle() {
      if (this.radio !== null) {
        (this as any).$gtag.event(config.GTAG_ACTION_FAVORITE_TOGGLE, {
          event_category: config.GTAG_CATEGORY_SCHEDULE,
          event_label: this.radio.code_name,
          value: config.GTAG_ACTION_FAVORITE_TOGGLE_VALUE
        });

        this.toggleFavorite(this.radio);
      }
    },
    volumeFocus(status: boolean) {
      setTimeout(
          () => {
            if (!this.debounce) {
              this.volumeFocusDispatch({ element: 'icon', status });
            }
          },
          200
      );
    },
    togglePrevious() {
      if (this.prevRadio === null) {
        return;
      }

      (this as any).$gtag.event(config.GTAG_ACTION_TOGGLE_PREVIOUS, {
        event_category: config.GTAG_CATEGORY_PLAYER,
        event_label: this.prevRadio.code_name,
        value: config.GTAG_ACTION_TOGGLE_PREVIOUS_VALUE
      });

      this.togglePreviousDispatch();
    },
    setNextPlayer(nextUrl: string) {
      const nextPlayerId = this.audio.current === 1 ? 2 : 1;

      if (this.audio[`player${nextPlayerId}`] !== null
          && this.audio[`player${nextPlayerId}`].element !== null
          && this.audio[`player${nextPlayerId}`].url !== null
          && this.audio[`player${nextPlayerId}`].url !== nextUrl) {
        this.resetPlayer(nextPlayerId);
      }

      this.audio.current = nextPlayerId;
    }
  },
  /* eslint-disable operator-linebreak */
  /* eslint-disable object-shorthand */
  /* eslint-disable quote-props */
  /* eslint-disable func-names */
  watch: {
    'playing': function (val: PlayerStatus) {
      if (this.radio === null) {
        return;
      }

      if (val === PlayerStatus.Playing) {
        let channelName = null;

        if ((this.radio.type === config.PLAYER_TYPE_RADIO
            && this.radio.streams[this.radioStreamCodeName!].current_song === true)
            || (this.radio.type === config.PLAYER_TYPE_STREAM
                && this.radio.current_song === true)) {
          const channelNameEnd = this.radio.type === config.PLAYER_TYPE_RADIO
              ? this.radioStreamCodeName : this.radio.radio_stream_code_name;
          channelName = `song:${channelNameEnd}`;
        } else {
          channelName = `url:${this.streamUrl}`;
        }

        this.joinChannel(channelName);

        // timer on mobile menu
        const mobileTimerElems =
            document.getElementsByClassName(config.MOBILE_MENU_TIMER_CLASSNAME);
        Array.prototype.forEach.call(mobileTimerElems, (element) => {
          element.classList.remove('disabled');
        });
      } else if (val === PlayerStatus.Stopped && this.timerIsActive !== true) {
        // timer on mobile menu
        const mobileTimerElems =
            document.getElementsByClassName(config.MOBILE_MENU_TIMER_CLASSNAME);
        Array.prototype.forEach.call(mobileTimerElems, (element) => {
          element.classList.add('disabled');
        });
      }

      if (this.externalPlayer === true) { return; }

      if (val === PlayerStatus.Loading && this.streamUrl !== null) {
        const options = PlayerUtils.buildPlayOptions(this.radio);
        this.play(this.streamUrl, options);
      } else if (val === PlayerStatus.Stopped) {
        this.pause();
        // this.stop();
      }
    },
    'muted': function (val) {
      if (this.externalPlayer === true) { return; }

      /* if (window.audio !== undefined && window.audio !== null) {
        window.audio.muted = val;
      } */

      if (this.currentPlayer !== null && this.currentPlayer.element !== null) {
        this.currentPlayer.element.muted = val;
      }
    },
    'volume': function (val) {
      if (this.externalPlayer === true) { return; }

      /* if (window.audio !== undefined && window.audio !== null) {
        window.audio.volume = (val * 0.1);
      } */

      if (this.currentPlayer !== null) {
        this.currentPlayer.element.volume = (val * 0.1);
      }
    },
    'radioShowWatching': function (newVal, oldVal) {
      if (this.externalPlayer === true || this.playing !== PlayerStatus.Playing) { return; }

      let display = false;
      const [oldPlaying, oldRadio, oldShow] = oldVal.split('|');
      /* eslint-disable @typescript-eslint/no-unused-vars */
      const [_newPlaying, newRadio, newShow] = newVal.split('|');

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

      if (display) {
        PlayerUtils.showNotification(
            this.radio!,
            this.radioStreamCodeName!,
            this.show
        );
      }
    }
  },
});
</script>
