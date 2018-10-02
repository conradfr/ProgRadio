import Vue from 'vue';

import find from 'lodash/find';

import * as config from '../config/config';

const VueCookie = require('vue-cookie');

Vue.use(VueCookie);

const COOKIE_VOLUME = `${config.COOKIE_PREFIX}-volume`;
const COOKIE_MUTED = `${config.COOKIE_PREFIX}-muted`;

const initState = {
  playing: false,
  radio: null,
  volume: Vue.cookie.get(COOKIE_VOLUME)
    ? parseInt(Vue.cookie.get(COOKIE_VOLUME), 10) : config.DEFAULT_VOLUME,
  muted: Vue.cookie.get(COOKIE_MUTED) === 'true' || false,
  focus: {
    icon: false,
    fader: false
  }
};

const getters = {
  radioPlayingCodeName: state => (state.radio !== null ? state.radio.code_name : null),
  displayVolume: state => state.focus.icon || state.focus.fader || false
};

const actions = {
  play: ({ commit, rootState }, radioId) => {
    commit('stop');

    const radio = find(rootState.schedule.radios, { code_name: radioId });
    if (radio !== undefined) {
      commit('switchRadio', radio);
      // Otherwise will be ignored
      Vue.nextTick(() => {
        commit('play');
      });
    }
  },
  togglePlay: ({ commit }) => {
    commit('togglePlay');
  },
  toggleMute: ({ state, commit }) => {
    Vue.cookie.set(COOKIE_MUTED, !state.muted, { expires: config.COOKIE_TTL });
    commit('toggleMute');
  },
  setVolume: ({ commit }, volume) => {
    Vue.cookie.set(COOKIE_VOLUME, volume, { expires: config.COOKIE_TTL });
    commit('setVolume', volume);
  },
  volumeFocus: ({ commit }, params) => {
    commit('setFocus', params);
  }
};

const mutations = {
  stop(state) {
    state.playing = false;
  },
  play(state) {
    if (state.radio !== null) {
      state.playing = true;
    }
  },
  switchRadio(state, radio) {
    state.radio = null;
    state.radio = radio;
  },
  togglePlay(state) {
    if (state.playing === true) {
      state.playing = false;
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
  }
};

export default {
  state: initState,
  getters,
  actions,
  mutations
};
