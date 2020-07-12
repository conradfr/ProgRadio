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
  play: ({ commit, rootState, rootGetters }, radioId) => {
    commit('stop');

    const radio = find(rootState.schedule.radios, { code_name: radioId });

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
  updateStatusFromExternalPlayer: ({ commit }, playing) => {
    commit('setPlayingStatus', playing);
  },
};

const storeMutations = {
  stop(state) {
    state.playing = false;
    AndroidApi.pause();
  },
  play(state) {
    if (state.radio !== null) {
      state.playing = true;
      // AndroidApi.play(state.radio);
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

    state.radio = null;
    state.radio = radio;

    state.show = null;
    state.show = show;

    // AndroidApi.play(radio, show);
    //
    // if (Object.is(radio, prevRadio) === false || Object.is(show, prevShow) === false) {
    //   AndroidApi.update(radio, show);
    // }

    PlayerUtils.showNotification(radio, show);
  },
  togglePlay(state) {
    if (state.playing === true) {
      state.playing = false;
      // AndroidApi.pause();
    } else if (state.playing === false && state.radio !== undefined && state.radio !== null) {
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
  setPlayingStatus(state, playing) {
    state.playing = playing;
  }
};

export default {
  state: initState,
  getters: storeGetters,
  actions: storeActions,
  mutations: storeMutations
};
