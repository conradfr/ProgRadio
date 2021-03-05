import Vue from 'vue';

import {
  CACHE_KEY_RADIO_FAVORITES,
  CACHE_KEY_STREAM_FAVORITES
} from '../config/config';

import cache from '../utils/cache';

import UserApi from '../api/UserApi';
import * as config from '../config/config';
import ScheduleApi from '../api/ScheduleApi';
import StreamsApi from '../api/StreamsApi';

// initial state
/* eslint-disable no-undef */
const initState = {
  logged: false,
  favoritesRadio: cache.hasCache(CACHE_KEY_RADIO_FAVORITES)
    ? cache.getCache(CACHE_KEY_RADIO_FAVORITES) : [],
  favoritesStream: cache.hasCache(CACHE_KEY_STREAM_FAVORITES)
    ? cache.getCache(CACHE_KEY_STREAM_FAVORITES) : [],
};

// getters
const storeGetters = {

};

// actions
const storeActions = {
  getUserData: ({ dispatch, commit }) => {
    setTimeout(
      () => {
        UserApi.getUserData()
          .then(({ logged, favoritesRadio, favoritesStream }) => {
            commit('updateLogged', logged);
            commit('updateRadioFavorites', favoritesRadio);
            commit('updateStreamFavorites', favoritesStream);

            dispatch('setFavoritesCollection', favoritesRadio);
            dispatch('setStreamFavorites', favoritesStream);

            cache.setCache(CACHE_KEY_RADIO_FAVORITES, favoritesRadio);
            cache.setCache(CACHE_KEY_STREAM_FAVORITES, favoritesStream);
          });
      },
      15
    );
  },
  syncRadioFavorites: ({ dispatch, state }) => {
    dispatch('setFavoritesCollection', state.favoritesRadio);
  },
  toggleRadioFavorite: ({ dispatch, state, commit }, radioCodeName) => {
    const { favoritesRadio } = state;
    const radioIndex = favoritesRadio.indexOf(radioCodeName);

    // is favorite
    if (radioIndex !== -1) {
      favoritesRadio.splice(radioIndex, 1);
    } else {
      favoritesRadio.push(radioCodeName);
    }

    setTimeout(() => {
      if (logged === true) {
        ScheduleApi.toggleFavoriteRadio(radioCodeName);
        return;
      }

      const favoritesAsString = favoritesRadio.join('|');
      Vue.cookie.set(config.COOKIE_RADIO_FAVORITES, favoritesAsString, config.COOKIE_PARAMS);
    }, 500);

    dispatch('setFavoritesCollection', favoritesRadio);
    commit('updateRadioFavorites', favoritesRadio);
    cache.setCache(CACHE_KEY_RADIO_FAVORITES, favoritesRadio);
  },
  toggleStreamFavorite: ({ dispatch, commit, state }, streamId) => {
    const { favoritesStream } = state;
    const favoriteIndex = favoritesStream.indexOf(streamId);

    if (favoriteIndex !== -1) {
      favoritesStream.splice(favoriteIndex, 1);
    } else {
      favoritesStream.push(streamId);
    }

    setTimeout(() => {
      if (logged === true) {
        StreamsApi.toggleFavoriteStream(streamId);
        return;
      }
      Vue.cookie.set(config.COOKIE_STREAM_FAVORITES, favoritesStream.join('|'), config.COOKIE_PARAMS);
    }, 500);

    dispatch('setStreamFavorites', favoritesStream);
    commit('updateStreamFavorites', favoritesStream);
    cache.setCache(CACHE_KEY_STREAM_FAVORITES, favoritesStream);
  }
};

// mutations
const storeMutations = {
  updateLogged: (state, value) => {
    Vue.set(state, 'logged', value);
  },
  updateRadioFavorites: (state, value) => {
    Vue.set(state, 'favoritesRadio', value);
  },
  updateStreamFavorites: (state, value) => {
    Vue.set(state, 'favoritesStream', value);
  }
};

export default {
  state: initState,
  getters: storeGetters,
  actions: storeActions,
  mutations: storeMutations
};
