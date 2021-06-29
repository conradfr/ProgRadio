import {
  CACHE_KEY_RADIO_FAVORITES,
  CACHE_KEY_STREAM_FAVORITES
} from '../config/config';

import cache from '../utils/cache';
import cookies from '../utils/cookies';

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
  toggleRadioFavorite: ({ dispatch, state, commit }, params) => {
    let radioCodeName = params;
    let cascade = true;

    if (typeof params === 'object') {
      radioCodeName = params.radioCodeName;
      cascade = params.cascade;
    }

    const { favoritesRadio } = state;
    const radioIndex = favoritesRadio.indexOf(radioCodeName);
    let add = false;

    // is favorite
    if (radioIndex !== -1) {
      favoritesRadio.splice(radioIndex, 1);
    } else {
      favoritesRadio.push(radioCodeName);
      add = true;
    }

    setTimeout(() => {
      if (logged === true) {
        ScheduleApi.toggleFavoriteRadio(radioCodeName)
          .then(() => {
            dispatch('getUserData');
          });
        return;
      }

      const favoritesAsString = favoritesRadio.join('|');
      cookies.set(config.COOKIE_RADIO_FAVORITES, favoritesAsString);

      // check if radio has a corresponding stream and add it to favorites (only non-logged)
      if (cascade === true) {
        StreamsApi.getBestFromRadio(radioCodeName)
          .then((data) => {
            if (data.stream === null
              /* already in favorites */
              || (add === true && state.favoritesStream.indexOf(data.stream.code_name) !== -1)) {
              return;
            }

            dispatch('toggleStreamFavorite', { streamId: data.stream.code_name, cascade: false });
          });
      }
    }, 500);

    dispatch('setFavoritesCollection', favoritesRadio);
    commit('updateRadioFavorites', favoritesRadio);
    cache.setCache(CACHE_KEY_RADIO_FAVORITES, favoritesRadio);
  },
  toggleStreamFavorite: ({ dispatch, commit, state }, params) => {
    let streamId = params;
    let cascade = true;

    if (typeof params === 'object') {
      streamId = params.streamId;
      cascade = params.cascade;
    }

    const { favoritesStream } = state;
    const favoriteIndex = favoritesStream.indexOf(streamId);
    let add = false;

    if (favoriteIndex !== -1) {
      favoritesStream.splice(favoriteIndex, 1);
    } else {
      add = true;
      favoritesStream.push(streamId);
    }

    setTimeout(() => {
      if (logged === true) {
        StreamsApi.toggleFavoriteStream(streamId)
          .then(() => {
            dispatch('getUserData');
          });
        return;
      }

      cookies.set(config.COOKIE_STREAM_FAVORITES, favoritesStream.join('|'));

      // check if stream has a radio attached and add it to favorites (only non-logged)
      if (cascade === true) {
        StreamsApi.getRadios(streamId)
          .then((data) => {
            if (data.streams.length === 0 || data.streams[0].radio_code_name === null
              /* already in favorites */
              || (add === true
                && state.favoritesRadio.indexOf(data.streams[0].radio_code_name) !== -1)) {
              return;
            }

            dispatch('toggleRadioFavorite', { radioCodeName: data.streams[0].radio_code_name, cascade: false });
          });
      }
    }, 500);

    // dispatch('setStreamFavorites', favoritesStream);
    commit('updateStreamFavorites', favoritesStream);
    cache.setCache(CACHE_KEY_STREAM_FAVORITES, favoritesStream);
  }
};

// mutations
const storeMutations = {
  updateLogged: (state, value) => {
    state.logged = value;
  },
  updateRadioFavorites: (state, value) => {
    state.favoritesRadio = value;
  },
  updateStreamFavorites: (state, value) => {
    state.favoritesStream = value;
  }
};

export default {
  state: initState,
  getters: storeGetters,
  actions: storeActions,
  mutations: storeMutations
};
