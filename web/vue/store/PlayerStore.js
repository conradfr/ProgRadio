import Vue from 'vue';
const VueCookie = require('vue-cookie');
Vue.use(VueCookie);

import collection from 'lodash/collection';

import * as config from '../config/config.js';

const COOKIE_VOLUME = `${config.COOKIE_PREFIX}-volume`;
const COOKIE_MUTED = `${config.COOKIE_PREFIX}-muted`;

const PlayerStore = {
    state: {
        playing: false,
        radio: null,
        volume: Vue.cookie.get(COOKIE_VOLUME) ? parseInt(Vue.cookie.get(COOKIE_VOLUME)) : config.DEFAULT_VOLUME,
        muted: Vue.cookie.get(COOKIE_MUTED) === 'true' || false,
        focus: {
            icon: false,
            fader: false
        }
    },
    getters: {
        radioPlayingCodeName: state => {
          return state.radio !== null ? state.radio.code_name : null
        },
        displayVolume: state => {
            return state.focus.icon || state.focus.fader || false;
        }
    },
    mutations: {
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
            }
            else if (state.playing === false && state.radio !== undefined && state.radio !== null) {
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
    },
    actions: {
        play: ({state, commit, rootState}, radio_id) => {
            commit('stop');

            const radio = collection.find(rootState.schedule.radios, {'code_name': radio_id});
            if (radio !== undefined) {
                commit('switchRadio', radio);
                // Otherwise will be ignored
                Vue.nextTick(function () {
                    commit('play');
                })
            }
        },
        togglePlay: ({commit}) => {
            commit('togglePlay');
        },
        toggleMute: ({state, commit}) => {
            Vue.cookie.set(COOKIE_MUTED, !state.muted, {expires: config.COOKIE_TTL});
            commit('toggleMute');
        },
        setVolume: ({commit}, volume) => {
            Vue.cookie.set(COOKIE_VOLUME, volume, {expires: config.COOKIE_TTL});
            commit('setVolume', volume);
        },
        volumeFocus: ({commit}, params) => {
            commit('setFocus', params);
        }
    }
};

export default PlayerStore;
