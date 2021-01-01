import Vue from 'vue';

import find from 'lodash/find';

import * as config from '../config/config';
import AndroidApi from '../api/AndroidApi';
import StreamsApi from '../api/StreamsApi';
import PlayerUtils from '../utils/PlayerUtils';
import ScheduleUtils from '../utils/ScheduleUtils';

const VueCookie = require('vue-cookie');

Vue.use(VueCookie);

const initState = {
  playing: false,
  externalPlayer: AndroidApi.hasAndroid,
  // externalPlayer: false,
  radio: Vue.cookie.get(config.COOKIE_LAST_RADIO_PLAYED)
    ? JSON.parse(Vue.cookie.get(config.COOKIE_LAST_RADIO_PLAYED)) : null,
  show: null,
  volume: Vue.cookie.get(config.COOKIE_VOLUME)
    ? parseInt(Vue.cookie.get(config.COOKIE_VOLUME), 10) : config.DEFAULT_VOLUME,
  muted: Vue.cookie.get(config.COOKIE_MUTED) === 'true' || false,
  focus: {
    icon: false,
    fader: false
  }
};

const storeGetters = {
  radioPlayingCodeName: state => (state.radio !== null ? state.radio.code_name : null),
  displayVolume: state => state.focus.icon || state.focus.fader || false
};

const storeActions = {
  play: ({ commit, rootState, rootGetters }, radioCodeName) => {
    commit('stop');

    const radio = find(rootState.schedule.radios, { code_name: radioCodeName });

    if (radio !== undefined && radio.streaming_enabled === true) {
      Vue.cookie.set(config.COOKIE_LAST_RADIO_PLAYED, JSON.stringify(radio), config.COOKIE_PARAMS);
      const show = rootGetters.currentShowOnRadio(radio.code_name);
      commit('switchRadio', { radio, show });
      // Otherwise will be ignored
      Vue.nextTick(() => {
        commit('play');
      });
    }
  },
  stop: ({ commit }) => {
    commit('pause');
  },
  playStream: ({ rootState, commit }, stream) => {
    commit('stop');

    setTimeout(() => {
      StreamsApi.incrementPlayCount(stream.code_name, rootState.streams.radioBrowserApi);
    }, 500);
    Vue.cookie.set(config.COOKIE_LAST_RADIO_PLAYED, JSON.stringify(stream), config.COOKIE_PARAMS);

    commit('switchRadio', { radio: stream, show: null });

    // Otherwise will be ignored
    Vue.nextTick(() => {
      commit('play');
    });
  },
  togglePlay: ({ commit }) => {
    commit('togglePlay');
  },
  toggleMute: ({ state, commit }) => {
    Vue.cookie.set(config.COOKIE_MUTED, !state.muted, config.COOKIE_PARAMS);
    commit('toggleMute');
  },
  playPrevious: ({ state, dispatch }) => {
    if (state.radio === undefined || state.radio === null
      || state.radio.type !== config.PLAYER_TYPE_RADIO) {
      return;
    }

    dispatch('playNext', 'backward');
  },
  playNext: ({ rootState, state, dispatch }, way) => {
    if (state.radio === undefined || state.radio === null
      || state.radio.type !== config.PLAYER_TYPE_RADIO) {
      return;
    }

    const collectionToIterateOn = find(rootState.schedule.collections,
      { code_name: state.radio.collection });

    const radios = ScheduleUtils.rankCollection(collectionToIterateOn,
      rootState.schedule.radios, rootState.schedule.categoriesExcluded);
    const nextRadio = PlayerUtils.getNextRadio(state.radio, radios, way || 'forward');

    if (nextRadio !== null) {
      dispatch('play', nextRadio.code_name);
    }
  },
  setVolume: ({ commit }, volume) => {
    Vue.cookie.set(config.COOKIE_VOLUME, volume, config.COOKIE_PARAMS);
    commit('setVolume', volume);
  },
  volumeFocus: ({ commit }, params) => {
    commit('setFocus', params);
  },
  /* From Android app */
  updateStatusFromExternalPlayer: ({ rootState, commit }, params) => {
    const { playbackState, radioCodeName } = params;

    const parse = () => {
      let radio = find(rootState.schedule.radios, { code_name: radioCodeName });
      let show = null;

      // if not radio, maybe stream
      // @todo better handling of both types
      if (radio === undefined) {
        radio = find(rootState.streams.streamRadios, { code_name: radioCodeName });
      } else {
        show = rootState.schedule.getters.currentShowOnRadio(radio.CodeName);
      }

      if (radio !== undefined /* && radio.streaming_enabled === true */
        && config.PLAYER_STATE.indexOf(playbackState) !== -1) {
        commit('updatePlayingStatus', { radio, show, playbackState });
      }
    };

    parse();

    setTimeout(
      () => {
        parse();
      },
      1000
    );
  },
};

const storeMutations = {
  pause(state) {
    if (state.externalPlayer === true) {
      AndroidApi.pause();
      return;
    }

    state.playing = false;
  },
  stop(state) {
    state.playing = false;
  },
  play(state) {
    if (state.externalPlayer === true) {
      return;
    }
    if (state.radio !== null) {
    /* if (state.externalPlayer === true) {
        AndroidApi.play(state.radio, state.show);
        return;
      } */

      state.playing = true;
    }
  },
  switchRadio(state, { radio, show }) {
    const prevRadioCodeName = state.radio === null ? null : state.radio.code_name;
    const prevShowHash = state.show === null ? null : state.show.hash;

    if ((radio !== null && prevRadioCodeName === radio.code_name)
      && ((show !== null && prevShowHash === show.hash)
        || (prevShowHash === null && show === null))) {
      return;
    }

    if (radio !== null && state.externalPlayer === true) {
      AndroidApi.play(radio, show);
      // return;
    }

    state.radio = null;
    state.radio = radio;

    state.show = null;
    state.show = show;

    PlayerUtils.showNotification(radio, show);
  },
  togglePlay(state) {
    if (state.playing === true) {
      if (state.externalPlayer === true) {
        AndroidApi.pause();
        return;
      }

      state.playing = false;
    } else if (state.playing === false && state.radio !== undefined && state.radio !== null) {
      if (state.externalPlayer === true) {
        AndroidApi.play(state.radio, state.show);
        return;
      }

      state.playing = true;
    }
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
  /* From Android app */
  updatePlayingStatus(state, params) {
    const { playbackState, radio } = params;

    state.playing = playbackState === config.PLAYER_STATE_PLAYING;
    state.radio = radio;
    state.show = null;
  }
};

export default {
  state: initState,
  getters: storeGetters,
  actions: storeActions,
  mutations: storeMutations
};
