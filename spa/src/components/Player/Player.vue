<template>
  <!-- PLAYER XL -->
  <Transition name="player">
  <div v-if="xlPlayer" class="navbar-player navbar-player-xl">
    <div class="player-radio-expand cursor-pointer" v-on:click="toggleXLPLayer()">
      <i class="bi bi-arrows-angle-contract"></i>
    </div>
    <Transition name="play-prev-fade" mode="out-in">
      <div v-if="prevRadio" class="player-radio-previous"
           v-on:click="togglePrevious"
           :title="$i18n.t('message.player.previous', { radio: prevRadio.name })">
        <i class="bi-arrow-left-right"></i>
      </div>
    </Transition>
    <div class="h-100 d-flex justify-content-between align-items-center">
      <div class="navbar-player-header d-flex align-items-center">
        <PlayerImageXL />
        <PlayerPlayPause v-on:togglePlay="() => togglePlay()" :radio="radio" :playing="playing" />
        <PlayerInfoXL v-if="radio" />
        <div v-if="!radio" class="player-name player-name-help">
          {{ $t('message.player.placeholder') }}
        </div>
      </div>
      <PlayerSongXL v-if="radio && currentSong" />
      <div class="navbar-player-actions d-flex justify-content-end">
        <PlayerVolumeXL :muted="muted" v-on:toggleMute="() => toggleMute()" />
        <Transition name="timer-fade" mode="out-in">
          <PlayerSaveSong v-if="userLogged && currentSong" />
        </Transition>
        <PlayerFavorite v-if="radio" v-on:favoriteToggle="() => favoriteToggle()"
          :isFavorite="isFavorite" :favoriteTitle="favoriteTitle" />
        <timer></timer>
        <PlayerOutputSelector v-if="!isSafari && !externalPlayer" :selectedDeviceId="deviceId" :asIcon="true"
          v-on:changeOutput="(newDeviceId: string, stopIfPlaying: boolean) => changeDevice(newDeviceId, stopIfPlaying)"
        />
      </div>
    </div>
  </div>
  </Transition>

  <!-- PLAYER NAVBAR -->
  <Transition name="player">
  <div v-if="!xlPlayer" class="navbar-player navbar-player-navbar">
    <div class="d-none d-md-block player-radio-expand cursor-pointer" v-on:click="toggleXLPLayer()">
      <i class="bi bi-arrows-angle-expand"></i>
    </div>
    <Transition name="play-prev-fade" mode="out-in">
      <div v-if="prevRadio" class="player-radio-previous"
           v-on:click="togglePrevious"
           :title="$i18n.t('message.player.previous', { radio: prevRadio.name })">
        <i class="bi-arrow-left-right"></i>
      </div>
    </Transition>
    <div class="h-100 d-flex justify-content-center align-items-center">
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
      <PlayerPlayPause v-on:togglePlay="() => togglePlay()" :radio="radio" :playing="playing" />
      <PlayerOutputSelector v-if="!isSafari && !externalPlayer" :selectedDeviceId="deviceId"
        v-on:changeOutput="(newDeviceId: string, stopIfPlaying: boolean) => changeDevice(newDeviceId, stopIfPlaying)"
      />
      <PlayerInfoNavbar v-if="radio" />
      <Transition name="timer-fade" mode="out-in">
          <PlayerSaveSong v-if="userLogged && currentSong && currentSong[0]" />
      </Transition>
      <div v-if="!radio" class="player-name player-name-help">
        {{ $t('message.player.placeholder') }}
      </div>
      <PlayerFavorite v-if="radio" v-on:favoriteToggle="() => favoriteToggle()"
        :isFavorite="isFavorite" :favoriteTitle="favoriteTitle" />
      <timer></timer>
    </div>
    <PlayerVolumeNavbar v-if="displayVolume"/>
  </div>
  </Transition>
  <audio id="videoplayer1" playsinline="playsinline" style="display:none"></audio>
  <audio id="videoplayer2" playsinline="playsinline" style="display:none"></audio>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapActions } from 'pinia';
// import throttle from 'lodash/throttle';

/* eslint-disable import/no-cycle */
import { useGlobalStore } from '@/stores/globalStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useScheduleStore } from '@/stores/scheduleStore';
import { useStreamsStore } from '@/stores/streamsStore';
import { useUserStore } from '@/stores/userStore';

import PlayerStatus from '@/types/player_status';
import type { PlayOptions } from '@/types/play_options';

import * as config from '@/config/config';
import AndroidApi from '@/api/AndroidApi';
import PlayerUtils from '@/utils/PlayerUtils';
import tooltip from '@/utils/tooltip';
import cookies from '@/utils/cookies';
import typeUtils from '@/utils/typeUtils';
// eslint-disable-next-line import/extensions
import type Hls from '../../../js/hls.js';

import PlayerFavorite from './Common/PlayerFavorite.vue';
import PlayerPlayPause from './Common/PlayerPlayPause.vue';
import PlayerSaveSong from './Common/PlayerSaveSong.vue';
import Timer from '../Timer/Timer.vue';
import PlayerOutputSelector from './Common/PlayerOutputSelector.vue';

import PlayerInfoNavbar from './Navbar/PlayerInfoNavbar.vue';
import PlayerVolumeNavbar from './Navbar/PlayerVolumeNavbar.vue';

import PlayerImageXL from './XL/PlayerImageXL.vue';
import PlayerInfoXL from './XL/PlayerInfoXL.vue';
import PlayerSongXL from './XL/PlayerSongXL.vue';
import PlayerVolumeXL from './XL/PlayerVolumeXL.vue';

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
    hlsScript.src = '/js/hls.light.min.js';
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
    PlayerPlayPause,
    PlayerInfoNavbar,
    PlayerImageXL,
    PlayerInfoXL,
    PlayerSongXL,
    PlayerVolumeXL,
    PlayerFavorite,
    PlayerSaveSong,
    Timer,
    PlayerVolumeNavbar,
    PlayerOutputSelector,
  },
  /* eslint-disable indent */
  data(): {
    PlayerStatus: any,
    audio: PlayerAudio,
    hls: Hls|null,
    debounce: boolean,
    locale: string,
    videoModalElem: any,
    videoModalInstance: any,
    xlPlayer: boolean,
    isSafari: boolean,
    deviceId: string,
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
      locale: this.$i18n.locale,
      videoModalElem: null,
      videoModalInstance: null,
      xlPlayer: cookies.get(config.COOKIE_EXPAND_PLAYER, false) === 'true',
      // currently Safari does not list output devices, only input so we have to exclude the feature to do so
      isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
      // this is the default value for Chrome. Firefox is empty string but won't assign to the select anyway
      deviceId: 'default',
    };
  },
  created() {
    window.addEventListener('beforeunload', this.beforeWindowUnload);

    // timer on mobile menu
    const mobileTimerElems = document.getElementsByClassName(config.MOBILE_MENU_TIMER_CLASSNAME);

    Array.prototype.forEach.call(mobileTimerElems, (element) => {
      element.classList.remove('disabled');
    });
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

    // OS hotkeys support
    if ('mediaSession' in navigator) {
      setTimeout(
          () => {
            /* eslint-disable max-len */
            navigator.mediaSession.setActionHandler('previoustrack', this.keyPlayPrevious.bind(this));
            navigator.mediaSession.setActionHandler('nexttrack', this.keyPlayNext.bind(this));
            navigator.mediaSession.setActionHandler('play', this.keyPlayPause.bind(this));
            navigator.mediaSession.setActionHandler('pause', this.keyPlayPause.bind(this));
          },
          250
      );
    }
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
      'timerIsActive',
      'radio',
      'show',
      'prevRadio',
      'externalPlayer',
      'radioStreamCodeName',
      'playing',
      'muted',
      'volume',
      'currentSong',
      'videoModalUrl'
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
      return (this.radio !== null && this.isFavorite === true
          ? (this.$i18n as any).t('message.player.favorites.remove')
          : (this.$i18n as any).t('message.player.favorites.add'));
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
      playNextDispatch: 'playNext',
      playPreviousDispatch: 'playPrevious',
      stopDispatch: 'stop',
      volumeFocusDispatch: 'volumeFocus',
      joinChannel: 'joinChannel',
      updateFlux: 'updateFlux',
      playError: 'playError',
      setPlayerStatus: 'setPlayerStatus',
      setStreamPlayingError: 'setStreamPlayingError',
      setVideoModalUrl: 'setVideoModalUrl'
    }),
    beforeWindowUnload() {
      if (this.externalPlayer === false && this.playing !== PlayerStatus.Stopped) {
        this.stop();
      }
    },
    keyPlayPause() {
      this.togglePlayDispatch();
      // throttle(function (this: any) { this.togglePlayDispatch(); }, 200, { leading: true, trailing: false });
    },
    keyPlayPrevious() {
      this.playPreviousDispatch();
      // throttle(function (this: any) { this.playPreviousDispatch(); }, 200, { leading: true, trailing: false });
      },
    keyPlayNext() {
      this.playNextDispatch();
      // throttle(function (this: any) { this.playNextDispatch(); }, 200, { leading: true, trailing: false });
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
      this.hideVideoModal();

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

            // specific output
            if (this.deviceId && this.deviceId !== '' && this.deviceId !== 'default' && this.currentPlayer.element) {
              this.currentPlayer.element.setSinkId(this.deviceId);
            }

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
                  message: (this.$i18n as any).t('message.player.play_error'),
                  type: 'error'
                });

                this.playError();

                if (this.radio && this.radio.type === config.PLAYER_TYPE_STREAM) {
                  this.setStreamPlayingError(this.radio.code_name, data.details);
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

          // specific output
          if (this.deviceId && this.deviceId !== '' && this.deviceId !== 'default' && this.currentPlayer.element) {
            this.currentPlayer.element.setSinkId(this.deviceId);
          }

          // @ts-ignore
          this.currentPlayer.dash = dashjs.MediaPlayer().create();
          this.currentPlayer.dash.initialize(this.currentPlayer.element, url, false);

          this.currentPlayer.dash.on('error', () => {
            if (this.currentPlayer.id !== this.audio.current) {
              return;
            }

            this.displayToast({
              message: (this.$i18n as any).t('message.player.play_error'),
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
        // const streamUrl = (url.substring(0, 5) !== 'https')
            // eslint-disable-next-line no-undef
            // _@ts-expect-error apiUrl is defined on the global scope
            // ? `${streamsProxy}?k=${streamsProxyKey}&stream=${url}` : url;

        const streamUrl = url;
        this.currentPlayer.element = document.getElementById(this.currentPlayer.elementId);
        this.currentPlayer.element.src = streamUrl;

        // this.currentPlayer.element = new Audio(streamUrl);
        this.currentPlayer.element.muted = this.muted;
        this.currentPlayer.element.volume = (this.volume * 0.1);
        startPlayPromise = this.currentPlayer.element.play();

        // specific output
        if (this.deviceId && this.deviceId !== '' && this.deviceId !== 'default' && this.currentPlayer.element) {
          this.currentPlayer.element.setSinkId(this.deviceId);
        }
      }

      if (startPlayPromise !== undefined) {
        startPlayPromise.then(() => {
          this.playingStarted(this.currentPlayer);
        }).catch((error: any) => {
          if (this.currentPlayer.id !== this.audio.current) {
            return;
          }

          // if stream failed and is http we try to switch to our https proxy
          if (url.trim().substring(0, 5) !== 'https') {
            // @ts-expect-error apiUrl is defined on the global scope
            this.play(`${streamsProxy}?k=${streamsProxyKey}&stream=${url}`, options);
            return;
          }

          this.setPlayerStatus(PlayerStatus.Stopped);
          this.stop();

          if (error.name === 'NotAllowedError') {
            this.displayToast({
              message: (this.$i18n as any).t('message.player.autoplay_error'),
              type: 'error'
            });
          } else {
            this.displayToast({
              message: (this.$i18n as any).t('message.player.play_error'),
              type: 'error'
            });

            this.playError();

            if (this.radio && this.radio.type === config.PLAYER_TYPE_STREAM) {
              this.setStreamPlayingError(this.radio.code_name, error.name);
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
    },
    showVideoModal() {
      if (!this.videoModalElem) {
        // eslint-disable-next-line no-undef
        this.videoModalElem = document.getElementById('playerVideoModal');
      }

      if (!this.videoModalInstance) {
        // @ts-expect-error bootstrap is defined on global scope
        this.videoModalInstance = new bootstrap.Modal(this.videoModalElem);
      }

      if (this.videoModalInstance) {
        this.videoModalElem.addEventListener('hidden.bs.modal', () => {
          this.setVideoModalUrl(null);
        });

        this.videoModalInstance.show();
      }
    },
    hideVideoModal() {
      if (this.videoModalInstance) {
        this.videoModalInstance.hide();
      }
    },
    toggleXLPLayer() {
      (this as any).$gtag.event(config.GTAG_ACTION_PLAYER_EXPAND, {
        event_category: config.GTAG_CATEGORY_PLAYER,
        event_label: this.xlPlayer ? 'reduce' : 'expand',
        value: config.GTAG_ACTION_PLAYER_EXPAND_VALUE
      });

      cookies.set(config.COOKIE_EXPAND_PLAYER, !this.xlPlayer);
      this.xlPlayer = !this.xlPlayer;
    },
    changeDevice(deviceId: string, stopIfPlaying: boolean = false) {
      if (stopIfPlaying) {
        this.stopDispatch();
      }

      this.deviceId = deviceId;
      // Browser have inconsistent default behavior for default output.
      deviceId = deviceId && deviceId !== '' && deviceId !== 'default' ? deviceId : '';
      if (this.audio.player1 && this.audio.player1.element) {
        if (stopIfPlaying) {
          (this.audio.player1.element as HTMLMediaElement).pause();
        }

        // @ts-ignore
        (this.audio.player1.element as HTMLMediaElement).setSinkId(deviceId);
      }

      if (this.audio.player2 && this.audio.player2.element) {
        if (stopIfPlaying) {
          (this.audio.player2.element as HTMLMediaElement).pause();
        }

        // @ts-ignore
        (this.audio.player2.element as HTMLMediaElement).setSinkId(deviceId);
      }
    },
  },
  /* eslint-disable operator-linebreak */
  /* eslint-disable object-shorthand */
  /* eslint-disable quote-props */
  /* eslint-disable func-names */
  watch: {
    playing(val: PlayerStatus) {
      if (this.radio === null) {
        return;
      }

      if (val === PlayerStatus.Playing) {
        let channelName;

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
    videoModalUrl(newVal) {
      if (!newVal) {
        this.hideVideoModal();
        return;
      }

      this.showVideoModal();
    },
    muted(val) {
      if (this.externalPlayer === true) { return; }

      /* if (window.audio !== undefined && window.audio !== null) {
        window.audio.muted = val;
      } */

      if (this.currentPlayer !== null && this.currentPlayer.element !== null) {
        this.currentPlayer.element.muted = val;
      }
    },
    volume(val) {
      if (this.externalPlayer === true) { return; }

      /* if (window.audio !== undefined && window.audio !== null) {
        window.audio.volume = (val * 0.1);
      } */

      if (this.currentPlayer !== null) {
        this.currentPlayer.element.volume = (val * 0.1);
      }
    },
    radioShowWatching(newVal, oldVal) {
      if (this.externalPlayer === true || this.playing !== PlayerStatus.Playing) { return; }

      let display = false;
      const [oldPlaying, oldRadio, oldShow] = oldVal.split('|');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
