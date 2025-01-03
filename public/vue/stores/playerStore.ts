import { defineStore } from 'pinia';
import { markRaw, nextTick, toRaw } from 'vue';
import { DateTime } from 'luxon';
import find from 'lodash/find';

import type { Radio } from '@/types/radio';
import type { Stream } from '@/types/stream';
import type { Program } from '@/types/program';
import type { Songs } from '@/types/song';
import type { Listeners } from '@/types/listeners';
import type { ListeningSession } from '@/types/listening_session';
import type { ChannelsRefCount } from '@/types/channels_ref_count';
import PlayerStatus from '@/types/player_status';

/* eslint-disable import/no-cycle */
import { useGlobalStore } from '@/stores/globalStore';
import { useScheduleStore } from '@/stores/scheduleStore';
import { useStreamsStore } from '@/stores/streamsStore';
import { useUserStore } from '@/stores/userStore';

import * as config from '@/config/config';
import cookies from '@/utils/cookies';
import cache from '@/utils/cache';
import i18n from '@/lang/i18n';
import typeUtils from '@/utils/typeUtils';
import PlayerUtils from '@/utils/PlayerUtils';
import ScheduleUtils from '@/utils/ScheduleUtils';
import StreamsApi from '@/api/StreamsApi';
import AndroidApi from '@/api/AndroidApi';

import { Socket } from '../../js/phoenix/index';

interface Focus {
  icon: boolean,
  fader: boolean
}

interface State {
  socket: any
  socketHasClosed: boolean
  socketTimer: number|null
  channels:any
  channelsRefCount: ChannelsRefCount
  playing: PlayerStatus
  externalPlayer: boolean
  externalPlayerVersion: number|null
  radio: Radio|Stream|null
  radioStreamCodeName: string|null
  prevRadio: Radio|Stream|null
  prevRadioStreamCodeName: string|null
  show: Program|null
  song: Songs
  listeners: Listeners
  flux: any
  volume: number
  muted: boolean
  session: ListeningSession;
  sessionInterval: number|null
  focus: Focus;
  timer: number
  timerInterval: number|null
  // hack to avoid complex component interaction
  // as the modal needs to be at the root
  videoModalUrl: string|null
}

const flux = PlayerUtils.calculatedFlux();

/* eslint-disable import/prefer-default-export */
export const usePlayerStore = defineStore('player', {
  state: (): State => ({
    socket: null,
    socketHasClosed: false,
    socketTimer: null,
    channels: {},
    channelsRefCount: {},
    playing: PlayerStatus.Stopped,
    externalPlayer: AndroidApi.hasAndroid,
    externalPlayerVersion: AndroidApi.getVersion(),
    radio: cache.hasCache(config.LAST_RADIO_PLAYED)
      ? cache.getCache(config.LAST_RADIO_PLAYED) : null,
    radioStreamCodeName: cache.hasCache(config.LAST_RADIO_STREAM_PLAYED)
      ? cache.getCache(config.LAST_RADIO_STREAM_PLAYED) : null,
    prevRadio: cache.hasCache(config.PREV_RADIO_PLAYED)
      ? cache.getCache(config.PREV_RADIO_PLAYED) : null,
    prevRadioStreamCodeName: cache.hasCache(config.PREV_RADIO_STREAM_PLAYED)
      ? cache.getCache(config.PREV_RADIO_STREAM_PLAYED) : null,
    show: null,
    song: {},
    listeners: {},
    flux,
    volume: parseInt(cookies.get(config.COOKIE_VOLUME, config.DEFAULT_VOLUME), 10),
    muted: cookies.get(config.COOKIE_MUTED, 'false') === 'true',
    session: {
      start: null,
      id: null,
      ctrl: null
    },
    sessionInterval: null,
    focus: {
      icon: false,
      fader: false
    },
    timer: 0,
    timerInterval: null,
    videoModalUrl: null
  }),
  getters: {
    radioPlayingCodeName: state => (state.radio !== null ? state.radio.code_name : null),
    displayVolume: state => state.focus.icon || state.focus.fader || false,
    timerIsActive: state => state.timer !== undefined && state.timer !== null && state.timer !== 0,
    streamUrl: (state) => {
      if (state.radio === null) { return null; }

      if (typeUtils.isStream(state.radio) || state.radioStreamCodeName === null) {
        return state.radio.stream_url;
      }

      return state.radio.streams[state.radioStreamCodeName].url;
    },
    liveSong: state => (radio: Radio|Stream, radioStreamCodeName: string|null): string|null => {
      if (!radio || (typeUtils.isRadio(state.radio) && !(radio as Radio).streaming_enabled)) {
        return null;
      }

      const channelName = PlayerUtils.getChannelName(toRaw(radio), radioStreamCodeName!);
      // @todo find bug from app
      if (channelName === '') {
        return null;
      }

      if (state.song === null || state.song === undefined
        || !Object.prototype.hasOwnProperty.call(state.song, channelName)) {
        return null;
      }

      return PlayerUtils.formatSong(state.song[channelName].song);
    },
    currentSong(state): string|null {
      if (state.radio === null || state.radio === undefined) {
        return null;
      }

      return this.liveSong(state.radio, state.radioStreamCodeName);
    },
  },
  /* eslint-disable object-curly-newline */
  /* eslint-disable no-prototype-builtins */
  actions: {
    playRadio(params: any) {
      const global = useGlobalStore();
      const scheduleStore = useScheduleStore();

      this.stop();

      const { radioCodeName, streamCodeName } = params;
      const radio = find(scheduleStore.radios, { code_name: radioCodeName });

      if (radio === undefined || !radio.streaming_enabled) {
        return;
      }

      const stream = ScheduleUtils.getStreamFromCodeName(streamCodeName, radio);

      if (stream !== null) {
        cache.setCache(config.LAST_RADIO_PLAYED, radio);
        cache.setCache(config.LAST_RADIO_STREAM_PLAYED, stream.code_name);

        this.setPrevious({ radio, streamCodeName: stream.code_name });

        if (this.externalPlayer === true) {
          AndroidApi.play(radio, stream);

          setTimeout(() => {
            global.sendList(radio);
          }, 2000);
        } else {
          nextTick(() => {
            this.play({ radio, streamCodeName: stream.code_name });
            this.startListeningSession();
          });
        }

        nextTick(() => {
          this.updateShow();
        });
      }
    },
    /* eslint-disable no-param-reassign */
    playStream(stream: Stream) {
      const streamsStore = useStreamsStore();
      const userStore = useUserStore();

      this.stop();

      setTimeout(() => {
        StreamsApi.incrementPlayCount(stream.code_name, streamsStore.radioBrowserApi);
      }, 500);

      cache.setCache(config.LAST_RADIO_PLAYED, stream);
      cache.setCache(config.LAST_RADIO_STREAM_PLAYED, null);

      this.setPrevious({ radio: stream });

      // update last listened if user is logged and is stream
      // not set in interval below to no send it at each update, may change later
      setTimeout(() => {
        // todo move to api when support for auth users
        if (typeUtils.isStream(stream) && userStore.logged && userStore.storeHistory
          && this.radio !== null && this.radio.code_name === stream.code_name) {
          StreamsApi.updateLastListened(stream);
        }
      }, (config.LISTENING_SESSION_MIN_SECONDS + 5) * 1000);

      if (this.externalPlayer === true) {
        AndroidApi.play(stream);

        setTimeout(() => {
          // streamsStore.sendStreamsList(stream);
          streamsStore.sendStreamsList();
        }, 2000);

        return;
      }

      nextTick(() => {
        if (stream.popup) {
          // @ts-expect-error popupUrl is defined on the global scope
          // eslint-disable-next-line no-undef
          window.open(popupUrl.replace(config.POPUP_URL_WILDCARD, stream.code_name), '', config.POPUP_SETTINGS);
          return;
        }

        if (PlayerUtils.isVideoLink(stream.stream_url)) {
          this.videoModalUrl = stream.stream_url;
          return;
        }

        this.play({ radio: stream });
        this.startListeningSession();
      });
    },
    togglePlay() {
      if (this.playing !== PlayerStatus.Stopped) {
        if (this.externalPlayer === true) {
          AndroidApi.pause();
          return;
        }

        this.stop();
      } else {
        if (this.externalPlayer === true && (this.radio !== null && this.radio !== undefined)) {
          const stream = ScheduleUtils.getStreamFromCodeName(this.radioStreamCodeName, this.radio);
          AndroidApi.play(this.radio, stream);
          return;
        }

        this.resume();
        this.startListeningSession();
      }
    },
    play({ radio, streamCodeName = null }: { radio: Radio|Stream, streamCodeName?: string|null }) {
      this.radio = radio;
      this.radioStreamCodeName = streamCodeName || null;
      this.show = null;
      this.playing = PlayerStatus.Loading;
      // state.song = {};
      this.session = {
        start: DateTime.local().setZone(config.TIMEZONE),
        id: null,
        ctrl: Math.floor(Math.random() * 100000)
      };
    },
    resume() {
      this.playing = PlayerStatus.Loading;
      // state.song = null;
      this.session = {
        start: DateTime.local().setZone(config.TIMEZONE),
        id: null,
        ctrl: Math.floor(Math.random() * 100000)
      };
    },
    stop() {
      if (this.externalPlayer === true) {
        AndroidApi.pause();
        return;
      }

      if (this.playing === PlayerStatus.Playing) {
        PlayerUtils.sendListeningSession(
          this.playing,
          this.radio!,
          this.radioStreamCodeName,
          this.session,
          true);
      }

      // commit
      this.playing = PlayerStatus.Stopped;
      // state.song = null;
      this.session = { start: null, id: null, ctrl: null };
      if (this.sessionInterval !== null) {
        clearInterval(this.sessionInterval);
        this.sessionInterval = null;
      }
    },
    setPlayerStatus(playerStatus: PlayerStatus) {
      this.playing = playerStatus;
    },
    playStarted() {
      this.playing = PlayerStatus.Playing;
    },
    playError() {
      this.playing = PlayerStatus.Stopped;
    },
    // Previous in collection
    playPrevious() {
      this.playNext('backward');
    },
    // Next in collection
    playNext(way: 'backward'|'forward' = 'forward') {
      const scheduleStore = useScheduleStore();
      const streamsStore = useStreamsStore();

      // should not happen, maybe with old Android version so it's kept for now as a safeguard
      if (this.externalPlayer === true) {
        return;
      }

      this.stop();

      if (this.radio === undefined || this.radio === null) {
        return;
      }

      if (typeUtils.isRadio(this.radio)) {
        if ((scheduleStore.collections === null
          || Object.keys(scheduleStore.collections).length === 0)
          || scheduleStore.currentCollection === null
        ) {
          return;
        }

        const radios = ScheduleUtils.rankCollection(
          scheduleStore.currentCollection,
          scheduleStore.collections,
          scheduleStore.radios,
          scheduleStore.categoriesExcluded,
          scheduleStore.preRollExcluded
        );

        const nextRadio = PlayerUtils.getNextRadio(this.radio, radios, way || 'forward');

        if (nextRadio !== null) {
          this.setPrevious({ radio: nextRadio, streamCodeName: `${nextRadio.code_name}_main` });
          this.playRadio({
            radioCodeName: nextRadio.code_name,
            streamCodeName: `${nextRadio.code_name}_main`
          });
        }
      } else if (typeUtils.isStream(this.radio)) {
        const nextRadio = PlayerUtils.getNextStream(
          this.radio,
          streamsStore.streamRadios,
          way || 'forward'
        );

        if (nextRadio !== null) {
          this.setPrevious({ radio: nextRadio });
          this.playStream(nextRadio);
        }
      }
    },
    // Previously played radio
    togglePrevious() {
      if (this.prevRadio === undefined || this.prevRadio === null) {
        return;
      }

      const prevRadio = toRaw(this.prevRadio);
      const currentRadio = this.radio;

      const currentStreamCodeName = this.radioStreamCodeName;

      if (typeUtils.isRadio(prevRadio)) {
        this.playRadio({
          radioCodeName: prevRadio.code_name,
          streamCodeName: this.prevRadioStreamCodeName
        });
      } else if (typeUtils.isStream(prevRadio)) {
        this.playStream(prevRadio);
      }

      this.setPrevious({ radio: currentRadio!, streamCodeName: currentStreamCodeName });
    },
    /* eslint-disable max-len */
    setPrevious({ radio, streamCodeName = null }: { radio: Radio|Stream, streamCodeName?: string|null }) {
      if (this.radio !== null && (this.radio.code_name !== radio.code_name
        || this.radioStreamCodeName !== (streamCodeName || null))) {
        cache.setCache(config.PREV_RADIO_PLAYED, this.radio);
        cache.setCache(config.PREV_RADIO_STREAM_PLAYED, this.radioStreamCodeName);

        this.prevRadio = this.radio;
        this.prevRadioStreamCodeName = this.radioStreamCodeName || null;
      }
    },
    startListeningSession() {
      /* eslint-disable function-call-argument-newline */
      this.sessionInterval = setInterval(() => {
        PlayerUtils.sendListeningSession(this.playing,
          this.radio!, this.radioStreamCodeName, this.session);
      }, config.LISTENING_SESSION_MIN_SECONDS * 1000);
    },
    setListeningSessionId({ id, ctrl }: { id: string, ctrl: number }) {
      if (this.playing && ctrl === this.session.ctrl) {
        this.session.id = id;
      }
    },
    setListeningSession({ data, ctrl }: { data: any, ctrl: number }) {
      if (this.playing && ctrl === this.session.ctrl) {
        this.session.id = data.id;
        this.session.start = DateTime.fromISO(data.date_time_start).setZone(config.TIMEZONE);
      }
    },
    async setStreamPlayingError(codeName: string, errorText?: string) {
      await StreamsApi.addStreamPlayingError(codeName, errorText);
    },
    updateRadio() {
      this.show = null;
    },
    updateShow() {
      const scheduleStore = useScheduleStore();

      if (this.radio === null || !typeUtils.isRadio(this.radio)) {
        return;
      }

      const stream = ScheduleUtils.getStreamFromCodeName(this.radioStreamCodeName, this.radio);

      // secondary streams have no schedule
      this.show = stream !== null && stream.main === true
        ? scheduleStore.currentShowOnRadio(this.radio.code_name) : null;
    },
    connectSocket() {
      if (!this.socket) {
        const opts = {

          heartbeatIntervalMs: config.WEBSOCKET_HEARTBEAT,
          reconnectAfterMs: (tries: number) => {
            if (tries >= config.WEBSOCKET_MAX_RETRIES) {
              return null;
            }

            // eslint-disable-next-line max-len
            return [1000, 5000, 10000, 15000, 20000, 25000, 50000, 100000, 200000, 500000, 1000000, 2000000][tries - 1] || 30000;
          }
        };

        // @ts-expect-error apiUrl is defined on the global scope
        // eslint-disable-next-line no-undef
        this.socket = new Socket(`wss://${apiUrl}/socket`, opts);

        this.socket.onOpen(() => {
          this.setSocketTimer();

          if (this.socketHasClosed === true) {
            Object.entries(this.channelsRefCount).forEach(
              ([key, value]) => {
                if (value > 0) {
                  const topicName = PlayerUtils.extractTopicName(key);

                  if (topicName) {
                    this.joinChannel(key, topicName);
                  } else {
                    this.joinChannel(key);
                  }
                }
              }
            );
          }

          this.socketHasClosed = false;
        });

        this.socket.onClose(() => {
          // this.channels = {};
          this.song = {};
          this.socketHasClosed = true;
          this.listeners = {};
          // this.socket = null;
          this.clearSocketTimer();
        });

        /* this.socket.onError((error: any) => {
          console.log(error);
        }); */
      }

      if (this.socket && !this.socket.isConnected()) {
        this.socket.connect();
      }
    },
    setSocketTimer() {
      // reset if currently one
      this.clearSocketTimer();

      this.socketTimer = setTimeout(() => {
        if (this.socket) {
          this.socket.disconnect();
          this.socketTimer = null;
        }
      }, config.WEBSOCKET_DISCONNECT_AFTER);
    },
    clearSocketTimer() {
      if (this.socketTimer) {
        clearTimeout(this.socketTimer);
        this.socketTimer = null;
      }
    },
    // todo clean this dual aspect of joinChannel & leaveChannel
    joinListenersChannel(topicName: string) {
      this.joinChannel(`listeners:${topicName}`, topicName);
    },
    leaveListenersChannel(topicName: string) {
      this.leaveChannel(`listeners:${topicName}`, topicName);
    },
    joinChannel(topicName: string, innerName: string|null = null) {
      // should not happen but...
      if (topicName === 'url:null') {
        return false;
      }

      /* TEMP
        No subscribing for mpd streams as we don't support it
        This will not catch "forced" mpd streams but there are not a lot so this is acceptable
      */
      if (topicName.startsWith('url:') && (topicName.indexOf('.mpd') !== -1
        || topicName.indexOf('youtu') !== -1)) {
        return null;
      }

      // Increment refCounter
      // Used because multiple component may want to join and leave the same channel and one would then leave for all

      let refCount = 1;
      if (Object.prototype.hasOwnProperty.call(this.channelsRefCount, topicName)) {
        refCount = this.channelsRefCount[topicName] + 1;
      }

      this.channelsRefCount = {
        ...this.channelsRefCount,
        [topicName]: refCount
      };

      // Channel already exists?
      if (Object.prototype.hasOwnProperty.call(this.channels, topicName)) {
        return false;
      }

      this.connectSocket();

      return nextTick(() => {
        setTimeout(() => {
          if (this.socket === null
            || Object.prototype.hasOwnProperty.call(this.channels, topicName)) {
            return;
          }

          this.channels[topicName] = this.socket.channel(topicName);

          if (this.channels.hasOwnProperty(topicName)) {
            this.channels[topicName].on('playing', (songData: any) => {
              this.setSong(songData);
            });

            this.channels[topicName].on('quit', () => {
              this.setSong({ name: topicName, song: null });
              this.leaveChannel(topicName);
            });

            this.channels[topicName].on('counter_update', (counterData: any) => {
              this.setListeners(counterData);
            });

            this.channels[topicName].join()
              // .receive('ok', ({ messages }) => console.log('catching up', messages))
              .receive('error', () => {
                if (topicName.startsWith('listeners:')) {
                  this.setListeners({ name: innerName, listeners: 0 });
                } else {
                  this.setSong({ name: topicName, song: null });
                }

                // this.leaveChannel(topicName);
              })
              .receive('timeout', () => {
                /* if (topicName.startsWith('listeners:')) {
                  this.setListeners({ name: innerName, listeners: 0 });
                } else {
                  this.setSong({ name: topicName, song: null });
                }

                this.leaveChannel(topicName); */
              });
          }
        }, 50);
      });
    },
    leaveChannel(topicName:string, innerName: string|null = null) {
      if (this.socket === null
        || !Object.prototype.hasOwnProperty.call(this.channels, topicName)) {
        return;
      }

      // decrement ref count
      if (Object.prototype.hasOwnProperty.call(this.channelsRefCount, topicName)) {
        this.channelsRefCount = {
          ...this.channelsRefCount,
          [topicName]: this.channelsRefCount[topicName] - 1
        };

        // don't leave if refCount not at 0
        if (this.channelsRefCount[topicName] > 0) {
          return;
        }
      }

      this.channels[topicName].leave();
      delete this.channels[topicName];

      // remove songs when they came from this channel
      if (!topicName.startsWith('listeners:')) {
        Object.entries(this.song).forEach(
          ([key, value]) => {
            if (value.topic === topicName) {
              delete this.song[key];
            }
          }
        );
      } else {
        Object.entries(this.listeners).forEach(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          ([key, _value]) => {
            if (key === innerName) {
              delete this.listeners[key];
            }
          }
        );
      }
    },
    setSong(songData?: any|null) {
      if (songData === null || songData === undefined) {
        // this.song = {};
        return;
      }

      const { topic, name, song } = songData;

      if (song === null) {
        if (name) {
          delete this.song[name];
        }
        return;
      }

      this.song = {
        ...this.song,
        [name]: markRaw({ topic, song })
      };
    },
    setListeners(songData: any|null) {
      if (!songData) {
        return;
      }

      const { name, listeners } = songData;

      if (!name || !listeners || listeners === 0) {
        if (name && listeners !== undefined) {
          delete this.listeners[name];
        }

        return;
      }

      this.listeners = {
        ...this.listeners,
        [name]: listeners
      };
    },
    toggleMute() {
      cookies.set(config.COOKIE_MUTED, !this.muted);
      this.muted = !this.muted;
    },
    setVolume(volume: number) {
      cookies.set(config.COOKIE_VOLUME, volume);
      this.volume = volume;
    },
    volumeFocus(params: {element: keyof Focus, status: boolean}) {
      this.focus[params.element] = params.status;
    },
    setTimer(minutes: number|null) {
      const global = useGlobalStore();

      if (minutes !== null && minutes > 0) {
        cookies.set(config.COOKIE_LAST_TIMER, minutes);
      }

      if (this.externalPlayer === true) {
        AndroidApi.timer(minutes);
        return;
      }

      this.setTimerCommit(minutes);

      // cancelling timer
      if (minutes === null || minutes === 0) {
        global.displayToast({
          message: i18n.global.tc('message.player.timer.cancelled'),
          type: config.TOAST_TYPE_INFO
        });
      }

      // setting timer
      if (minutes !== null && minutes > 0) {
        global.displayToast({
          message: i18n.global.tc('message.player.timer.set', minutes, { minutes }),
          type: config.TOAST_TYPE_INFO
        });

        // silently cancelling previous active timer
        if (this.timerInterval !== null) {
          this.setTimerCommit(null);
        }

        this.timerInterval = setInterval(() => {
          if (this.timer !== null) {
            this.setTimerCommit(this.timer - 1);
          }

          if (this.timer === 0) {
            this.stop();

            global.displayToast({
              message: i18n.global.tc('message.player.timer.finish'),
              type: config.TOAST_TYPE_INFO
            });
          }
        }, 60000);
      }

      this.setTimerCommit(minutes);
    },
    setTimerCommit(minutes: number|null) {
      // excludes mobile app
      if ((minutes === null || minutes === 0) && this.timerInterval !== null) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }

      this.timer = minutes || 0;
    },
    updateFlux() {
      this.flux = PlayerUtils.calculatedFlux();
    },
    /* From Android */
    updateTimerEnding(minutes: any) {
      this.setTimerCommit(typeof minutes === 'string' ? parseInt(minutes, 10) : minutes);
    },
    /* From Android */
    updateSong(songData: any|null) {
      this.setSong(songData);
    },
    setVideoModalUrl(url: string|null) {
      this.videoModalUrl = url;
    },
    /* From Android */
    /* eslint-disable no-param-reassign */
    updateStatusFromExternalPlayer(params: any) {
      const scheduleStore = useScheduleStore();
      const streamsStore = useStreamsStore();

      const { playbackState, radioCodeName } = params;

      let radio: Radio|Stream|null|undefined = find(scheduleStore.radios, { code_name: radioCodeName });
      let radioStream = null;

      // if not radio, maybe radio substream, or maybe stream
      // @todo better handling of types
      if (radio === undefined || radio === null) {
        let found = false;
        const radios = Object.keys(scheduleStore.radios);
        let i = 0;
        do {
          radioStream = scheduleStore.radios[radios[i]] !== undefined
          && scheduleStore.radios[radios[i]].streams !== undefined
            ? find(scheduleStore.radios[radios[i]].streams,
              { code_name: radioCodeName }) : undefined;

          if (radioStream !== undefined) {
            radio = scheduleStore.radios[radios[i]];
            found = true;
          }
          i += 1;
        } while (!found && i < radios.length);

        if (radio === undefined) {
          radio = streamsStore !== undefined
            ? find(streamsStore.streamRadios, { code_name: radioCodeName }) : undefined;
        }
      }

      let newPlaybackState = PlayerStatus.Stopped;

      if (playbackState === config.PLAYER_STATE_PLAYING) {
        newPlaybackState = PlayerStatus.Playing;
      } else if (playbackState === config.PLAYER_STATE_BUFFERING) {
        newPlaybackState = PlayerStatus.Loading;
      }

      if (radio !== undefined /* && radio.streaming_enabled === true */
        && config.PLAYER_STATE.indexOf(playbackState) !== -1) {
        this.playing = newPlaybackState;
        this.radio = radio;
        this.radioStreamCodeName = radioStream !== null
          && radioStream !== undefined ? radioStream.code_name : null;
        // state.show = show;

        nextTick(() => {
          this.updateShow();
        });
      }
    }
  }
});
