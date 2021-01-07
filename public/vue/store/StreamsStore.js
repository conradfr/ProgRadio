import Vue from 'vue';

import forEach from 'lodash/forEach';
import find from 'lodash/find';

import { STREAMS_DEFAULT_PER_PAGE } from '../config/config';

import * as config from '../config/config';
import i18n from '../lang/i18n';
import StreamsApi from '../api/StreamsApi';

const VueCookie = require('vue-cookie');

Vue.use(VueCookie);

const sortBySelect = [
  {
    code: 'name',
    label: i18n.tc('message.streaming.sort.name')
  },
  {
    code: 'popularity',
    label: i18n.tc('message.streaming.sort.popularity')
  },
  {
    code: 'random',
    label: i18n.tc('message.streaming.sort.random')
  },
];

// initial state
/* eslint-disable no-undef */
const initState = {
  countries: [],
  favorites: [],
  selectedCountry: Vue.cookie.get(config.COOKIE_STREAM_COUNTRY)
    ? JSON.parse(Vue.cookie.get(config.COOKIE_STREAM_COUNTRY)) : { code: 'FR', label: 'France' },
  streamRadios: [],
  selectedSortBy: Vue.cookie.get(config.COOKIE_STREAM_SORT)
    ? JSON.parse(Vue.cookie.get(config.COOKIE_STREAM_SORT)) : sortBySelect[1],
  radioBrowserApi: Vue.cookie.get(config.COOKIE_STREAM_RADIOBROWSER_API)
    ? Vue.cookie.get(config.COOKIE_STREAM_RADIOBROWSER_API) : null,
  sortBy: sortBySelect,
  searchActive: false,
  searchText: null,
  searchLastTimestamp: 0,
  total: 0,
  page: 1
};

// getters
const storeGetters = {
  countriesOptions: (state) => {
    const countriesOptions = [];
    countriesOptions.push(
      {
        label: i18n.tc('message.streaming.categories.favorites'),
        code: config.STREAMING_CATEGORY_FAVORITES
      },
      {
        label: i18n.tc('message.streaming.categories.all_countries'),
        code: config.STREAMING_CATEGORY_ALL
      }
    );
    forEach(state.countries, (value, key) => {
      countriesOptions.push(
        {
          label: value,
          code: key
        }
      );
    });

    return countriesOptions;
  }
};

// actions
const storeActions = {
  getConfig: ({ commit }) => {
    StreamsApi.getConfig()
      .then((data) => {
        Vue.cookie.set(config.COOKIE_STREAM_RADIOBROWSER_API,
          data.radio_browser_url, config.COOKIE_PARAMS);
        commit('setConfig', data);
      });
  },
  getCountries: ({ state, dispatch, commit }) => {
    commit('setLoading', true, { root: true });

    Vue.nextTick(() => {
      StreamsApi.getCountries()
        .then(countries => commit('updateCountries', countries))
        .then(() => {
          if (state.selectedCountry.label === null) {
            dispatch('countrySelection', state.selectedCountry.code);
          }
        })
        .finally(() => commit('setLoading', false, { root: true }));
    });
  },
  getFavorites: ({ commit }) => {
    // commit('setLoading', true, { root: true });

    Vue.nextTick(() => {
      StreamsApi.getFavorites()
        .then(favorites => commit('setFavorites', favorites));
      // .then(() => commit('setLoading', false, { root: true }));
    });
  },
  getStreamRadios: ({ state, commit }) => {
    commit('setLoading', true, { root: true });

    const offset = (state.page - 1) * STREAMS_DEFAULT_PER_PAGE;

    if (state.searchActive === true && state.searchText !== null) {
      Vue.nextTick(() => {
        StreamsApi.searchRadios(state.searchText, state.selectedCountry.code,
          state.selectedSortBy.code, offset)
          .then((data) => {
            if (data.timestamp > state.searchLastTimestamp) {
              commit('setSearchLastTimestamp', data.timestamp);
              commit('updateStreamRadios', data);
            }
          })
          .finally(() => commit('setLoading', false, { root: true }));
      });

      return;
    }

    Vue.nextTick(() => {
      StreamsApi.getRadios(state.selectedCountry.code, state.selectedSortBy.code, offset)
        .then(data => commit('updateStreamRadios', data))
        .finally(() => commit('setLoading', false, { root: true }));
    });
  },
  /* eslint-disable no-param-reassign */
  countrySelection: ({ getters, dispatch, commit }, country, getAfter) => {
    // if country is just country_code
    if (typeof country !== 'object') {
      country = find(getters.countriesOptions, ['code', country.toUpperCase()])
        || { code: country, label: null };
      if (country.label === null) {
        getAfter = false;
      }
    }

    commit('setSelectedCountry', country);
    Vue.cookie.set(config.COOKIE_STREAM_COUNTRY,
      JSON.stringify(country), config.COOKIE_PARAMS);

    if (getAfter !== false) {
      Vue.nextTick(() => {
        dispatch('getStreamRadios');
      });
    }
  },
  pageSelection: ({ dispatch, commit }, page) => {
    commit('setPage', page);

    Vue.nextTick(() => {
      dispatch('getStreamRadios');
    });
  },
  sortBySelection: ({ dispatch, commit }, sortBy) => {
    commit('setSelectedSortBy', sortBy);
    Vue.cookie.set(config.COOKIE_STREAM_SORT,
      JSON.stringify(sortBy), config.COOKIE_PARAMS);

    Vue.nextTick(() => {
      dispatch('getStreamRadios');
    });
  },
  playRandom: ({ state, dispatch, commit }) => {
    commit('setLoading', true, { root: true });

    Vue.nextTick(() => {
      StreamsApi.getRandom(state.selectedCountry.code)
        .then(data => dispatch('playStream', data))
        .finally(() => commit('setLoading', false, { root: true }));
    });
  },
  toggleStreamFavorite: ({ commit }, stream) => {
    commit('toggleStreamFavorite', stream);
  },
  setSearchActive: ({ state, commit, dispatch }, status) => {
    commit('setSearchActive', status);

    if (status === false) {
      const oldText = state.searchText;

      commit('setSearchText', null);

      if (oldText !== null && oldText !== '') {
        Vue.nextTick(() => {
          dispatch('getStreamRadios');
        });
      }
    }
  },
  setSearchText: ({ commit }, text) => {
    if (text !== null && text.trim() !== '') {
      commit('setSearchText', text);
    } else {
      commit('setSearchText', null);
    }
  }
};

// mutations
const storeMutations = {
  updateStreamRadios: (state, data) => {
    Object.freeze(data.streams);
    Vue.set(state, 'streamRadios', data.streams);
    Vue.set(state, 'total', data.total);
  },
  updateCountries: (state, value) => {
    Object.freeze(value);
    Vue.set(state, 'countries', value);
  },
  setFavorites: (state, value) => {
    Vue.set(state, 'favorites', value);
  },
  setConfig: (state, data) => {
    Object.freeze(data);
    Vue.set(state, 'radioBrowserApi', data.radio_browser_url);
  },
  setSelectedCountry: (state, value) => {
    Vue.set(state, 'selectedCountry', value);
    Vue.set(state, 'page', 1);
  },
  setSelectedSortBy: (state, value) => {
    Vue.set(state, 'selectedSortBy', value);
    Vue.set(state, 'page', 1);
  },
  setPage: (state, value) => {
    Vue.set(state, 'page', value);
  },
  setSearchActive: (state, status) => {
    Vue.set(state, 'searchActive', status);
  },
  setSearchText: (state, value) => {
    Vue.set(state, 'searchText', value);
  },
  setSearchLastTimestamp: (state, value) => {
    Vue.set(state, 'searchLastTimestamp', value);
  },
  toggleStreamFavorite(state, streamId) {
    const { favorites } = state;
    const favoriteIndex = favorites.indexOf(streamId);
    if (favoriteIndex !== -1) {
      favorites.splice(favoriteIndex, 1);
      Vue.set(state, 'favorites', favorites);
    } else {
      favorites.push(streamId);
      Vue.set(state, 'favorites', favorites);
    }

    setTimeout(() => {
      if (logged === true) {
        StreamsApi.toggleFavoriteStream(streamId);
        return;
      }
      Vue.cookie.set(config.COOKIE_STREAM_FAVORITES, favorites.join('|'), config.COOKIE_PARAMS);
    }, 500);
  }
};

export default {
  state: initState,
  getters: storeGetters,
  actions: storeActions,
  mutations: storeMutations
};
