import Vue from 'vue';

import find from 'lodash/find';
import { DateTime } from 'luxon';

import * as config from '../config/config';
import AndroidApi from '../api/AndroidApi';
import i18n from '../lang/i18n';
// import StreamsApi from '../api/StreamsApi';
import PlayerUtils from '../utils/PlayerUtils';
import ScheduleUtils from '../utils/ScheduleUtils';
import StreamsApi from '../api/StreamsApi';

const VueCookie = require('vue-cookie');

Vue.use(VueCookie);

const initState = {
  playing: false,
  externalPlayer: AndroidApi.hasAndroid,
  externalPlayerVersion: AndroidApi.getVersion(),
  radio: Vue.cookie.get(config.COOKIE_LAST_RADIO_PLAYED)
    ? JSON.parse(Vue.cookie.get(config.COOKIE_LAST_RADIO_PLAYED)) : null,
  radioStreamCodeName: Vue.cookie.get(config.COOKIE_LAST_RADIO_STREAM_PLAYED)
    ? JSON.parse(Vue.cookie.get(config.COOKIE_LAST_RADIO_STREAM_PLAYED)) : null,
  show: null,
  song: null,
  volume: Vue.cookie.get(config.COOKIE_VOLUME)
    ? parseInt(Vue.cookie.get(config.COOKIE_VOLUME), 10) : config.DEFAULT_VOLUME,
  muted: Vue.cookie.get(config.COOKIE_MUTED) === 'true' || false,
  session: {
    start: null,
    id: null
  },
  focus: {
    icon: false,
    fader: false
  },
  timer: 0,
  timerInterval: null
};

const storeGetters = {
  radioPlayingCodeName: state => (state.radio !== null ? state.radio.code_name : null),
  displayVolume: state => state.focus.icon || state.focus.fader || false,
  streamUrl: (state) => {
    if (state.radio === null) { return null; }

    if (state.radio.type === config.PLAYER_TYPE_STREAM || state.radioStreamCodeName === null) {
      return state.radio.stream_url;
    }

    return state.radio.streams[state.radioStreamCodeName].url;
  },
  currentSong: (state) => {
    if (state.song === undefined || state.song === null) {
      return null;
    }

    let song = '';
    let hasArtist = false;
    if (state.song.artist !== undefined && state.song.artist !== null
      && state.song.artist !== '') {
      song += state.song.artist;
      hasArtist = true;
    }

    if (state.song.title !== undefined && state.song.title !== null
      && state.song.title !== '') {
      if (hasArtist === true) {
        song += ' - ';
      }

      song += state.song.title;
    }

    return song === '' ? null : song;
  }
};

/* eslint-disable object-curly-newline */
const storeActions = {
  playRadio: ({ state, dispatch, commit, rootState }, params) => {
    dispatch('stop');

    const { radioCodeName, streamCodeName } = params;
    const radio = find(rootState.schedule.radios, { code_name: radioCodeName });

    if (radio === undefined || radio.streaming_enabled === false) {
      return;
    }

    const stream = ScheduleUtils.getStreamFromCodeName(streamCodeName, radio);

    if (stream !== null) {
      Vue.cookie.set(config.COOKIE_LAST_RADIO_PLAYED, JSON.stringify(radio), config.COOKIE_PARAMS);
      Vue.cookie.set(config.COOKIE_LAST_RADIO_STREAM_PLAYED,
        JSON.stringify(streamCodeName), config.COOKIE_PARAMS);

      if (state.externalPlayer === true) {
        AndroidApi.play(radio, stream);

        setTimeout(() => {
          dispatch('sendList', radio);
        }, 2000);
      } else {
        PlayerUtils.showNotification(radio, streamCodeName);
        Vue.nextTick(() => {
          commit('play', { radio, streamCodeName });
        });
      }

      Vue.nextTick(() => {
        dispatch('updateShow');
      });
    }
  },
  playStream: ({ rootState, dispatch, state, commit }, stream) => {
    dispatch('stop');

    setTimeout(() => {
      StreamsApi.incrementPlayCount(stream.code_name, rootState.streams.radioBrowserApi);
    }, 500);

    Vue.cookie.set(config.COOKIE_LAST_RADIO_PLAYED, JSON.stringify(stream), config.COOKIE_PARAMS);

    if (state.externalPlayer === true) {
      AndroidApi.play(stream);

      setTimeout(() => {
        dispatch('sendList', stream);
      }, 2000);

      return;
    }

    PlayerUtils.showNotification(stream);
    Vue.nextTick(() => {
      commit('play', { radio: stream });
    });
  },
  stop: ({ state, commit }) => {
    PlayerUtils.sendListeningSession(state.externalPlayer, state.playing,
      state.radio, state.radioStreamCodeName, state.session);

    if (state.externalPlayer === true) {
      AndroidApi.pause();
      return;
    }

    commit('stop');
  },
  togglePlay: ({ state, commit, dispatch }) => {
    if (state.playing === true) {
      if (state.externalPlayer === true) {
        AndroidApi.pause();
        return;
      }

      dispatch('stop');
    } else {
      if (state.externalPlayer === true && (state.radio !== null && state.radio !== undefined)) {
        const stream = ScheduleUtils.getStreamFromCodeName(state.radioStreamCodeName, state.radio);
        AndroidApi.play(state.radio, stream);
        return;
      }

      commit('resume');
    }
  },
  playPrevious: ({ dispatch }) => {
    dispatch('playNext', 'backward');
  },
  playNext: ({ rootState, state, dispatch }, way) => {
    // should not happen, maybe with old Android version so it's kept for now as a safeguard
    if (state.externalPlayer === true) {
      return;
    }

    PlayerUtils.sendListeningSession(state.externalPlayer, state.playing,
      state.radio, state.radioStreamCodeName, state.session);

    if (state.radio === undefined || state.radio === null) {
      return;
    }

    if (state.radio.type === config.PLAYER_TYPE_RADIO) {
      if (
        (rootState.schedule.collections === null || rootState.schedule.collections.length === 0)
        || rootState.schedule.currentCollection === null
      ) {
        return;
      }

      const collectionToIterateOn = find(rootState.schedule.collections,
        { code_name: rootState.schedule.currentCollection });
      const radios = ScheduleUtils.rankCollection(collectionToIterateOn,
        rootState.schedule.radios, rootState.schedule.categoriesExcluded);
      const nextRadio = PlayerUtils.getNextRadio(state.radio, radios, way || 'forward');

      if (nextRadio !== null) {
        dispatch('playRadio', { radioCodeName: nextRadio.code_name, streamCodeName: `${nextRadio.code_name}_main` });
      }
    } else if (state.radio.type === config.PLAYER_TYPE_STREAM) {
      const nextRadio = PlayerUtils.getNextStream(state.radio, rootState.streams.streamRadios, way || 'forward');

      if (nextRadio !== null) {
        dispatch('playStream', nextRadio);
      }
    }
  },
  updateRadio: ({ commit }) => {
    commit('updateRadio', {});
  },
  updateShow: ({ rootGetters, state, commit }) => {
    if (state.radio === null || state.radio.type !== config.PLAYER_TYPE_RADIO) {
      return;
    }

    const stream = ScheduleUtils.getStreamFromCodeName(state.radioStreamCodeName, state.radio);

    // secondary streams have no schedule
    const show = stream !== null && stream.main === true
      ? rootGetters.currentShowOnRadio(state.radio.code_name) : null;

    commit('setShow', show);
  },
  setSong: ({ commit }, song) => {
    commit('setSong', song);
  },
  toggleMute: ({ state, commit }) => {
    Vue.cookie.set(config.COOKIE_MUTED, !state.muted, config.COOKIE_PARAMS);
    commit('toggleMute');
  },
  setVolume: ({ commit }, volume) => {
    Vue.cookie.set(config.COOKIE_VOLUME, volume, config.COOKIE_PARAMS);
    commit('setVolume', volume);
  },
  volumeFocus: ({ commit }, params) => {
    commit('setFocus', params);
  },
  setTimer: ({ dispatch, state, commit }, minutes) => {
    if (typeof minutes === 'number' && minutes > 0) {
      Vue.cookie.set(config.COOKIE_LAST_TIMER, minutes, config.COOKIE_PARAMS);
    }

    if (state.externalPlayer === true) {
      AndroidApi.timer(minutes);
      return;
    }

    commit('setTimer', minutes);

    // cancelling timer
    if (minutes === null || minutes === 0) {
      dispatch('toast', {
        message: i18n.tc('message.player.timer.cancelled'),
        type: config.TOAST_TYPE_INFO
      });
    }

    // setting timer
    if (minutes !== null && minutes > 0) {
      dispatch('toast', {
        message: i18n.tc('message.player.timer.set', minutes, { minutes }),
        type: config.TOAST_TYPE_INFO
      });

      // silently cancelling previous active timer
      if (state.timerInterval !== null) {
        commit('setTimer', null);
      }

      state.timerInterval = setInterval(() => {
        commit('setTimer', state.timer - 1);

        if (state.timer === 0) {
          dispatch('stop');
          dispatch('toast', {
            message: i18n.tc('message.player.timer.finish'),
            type: config.TOAST_TYPE_INFO
          });
        }
      }, 60000);
    }

    commit('setTimer', minutes);
  },
  /* From Android */
  updateTimerEnding: ({ commit }, seconds) => {
    commit('setTimer', seconds);
  },
  /* From Android */
  updateStatusFromExternalPlayer: ({ rootState, dispatch, commit }, params) => {
    const { playbackState, radioCodeName } = params;

    let radio = find(rootState.schedule.radios, { code_name: radioCodeName });
    let radioStream = null;

    // if not radio, maybe radio substream, or maybe stream
    // @todo better handling of types
    if (radio === undefined || radio === null) {
      let found = false;
      const radios = Object.keys(rootState.schedule.radios);
      let i = 0;
      do {
        radioStream = find(rootState.schedule.radios[radios[i]].streams,
          { code_name: radioCodeName });

        if (radioStream !== undefined) {
          radio = rootState.schedule.radios[radios[i]];
          found = true;
        }
        i += 1;
      } while (found === false && i < radios.length);

      if (radio === undefined) {
        radio = find(rootState.streams.streamRadios, { code_name: radioCodeName });
      }
    }

    if (radio !== undefined /* && radio.streaming_enabled === true */
      && config.PLAYER_STATE.indexOf(playbackState) !== -1) {
      commit('updatePlayingStatus', { radio, radioStream, playbackState });

      Vue.nextTick(() => {
        dispatch('updateShow');
      });
    }
  }
};

const storeMutations = {
  play(state, { radio, streamCodeName }) {
    Vue.set(state, 'radio', radio);
    Vue.set(state, 'radioStreamCodeName', streamCodeName || null);
    Vue.set(state, 'show', null);
    Vue.set(state, 'playing', true);
    Vue.set(state, 'song', null);
    Vue.set(state, 'session', { start: DateTime.local().setZone(config.TIMEZONE), id: null });
  },
  resume(state) {
    Vue.set(state, 'playing', true);
    Vue.set(state, 'song', null);
    Vue.set(state, 'session', { start: DateTime.local().setZone(config.TIMEZONE), id: null });
  },
  stop(state) {
    Vue.set(state, 'playing', false);
    Vue.set(state, 'song', null);
    Vue.set(state, 'session', { start: null, id: null });
  },
  updateRadio(state, params) {
    state.show = params;
  },
  updatePlayingStatus(state, params) {
    const { playbackState, radio, radioStream } = params;

    Vue.set(state, 'playing', playbackState === config.PLAYER_STATE_PLAYING);
    Vue.set(state, 'radio', radio);
    Vue.set(state, 'radioStreamCodeName', radioStream !== null
      && radioStream !== undefined ? radioStream.code_name : null);
    // Vue.set(state, 'show', show);
  },
  setShow(state, show) {
    state.show = show;
  },
  setSong(state, song) {
    if (song === null || song === undefined) {
      state.song = null;
    }

    state.song = song;
  },
  toggleMute(state) {
    state.muted = !state.muted;
  },
  setVolume(state, volume) {
    state.volume = volume;
  },
  setFocus(state, params) {
    state.focus[params.element] = params.status;
  },
  setTimer(state, minutes) {
    // excludes mobile app
    if ((minutes === null || minutes === 0) && state.timerInterval !== null) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }

    state.timer = minutes;
  }
};

export default {
  state: initState,
  getters: storeGetters,
  actions: storeActions,
  mutations: storeMutations
};
