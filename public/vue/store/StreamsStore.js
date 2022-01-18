import { nextTick } from 'vue';

import forEach from 'lodash/forEach';
import find from 'lodash/find';

import * as config from '../config/config';
import i18n from '../lang/i18n';
import cookies from '../utils/cookies';
// import cache from '../utils/cache';
import StreamsApi from '../api/StreamsApi';
import AndroidApi from '../api/AndroidApi';

// initial state
/* eslint-disable no-undef */
const initState = {
  countries: [],
  favorites: [],
  selectedCountry: cookies.get(config.COOKIE_STREAM_COUNTRY, defaultCountry),
  streamRadios: [],
  soloExtended: null,
  selectedSortBy: cookies.get(config.COOKIE_STREAM_SORT, config.STREAMING_DEFAULT_SORT),
  radioBrowserApi: cookies.get(config.COOKIE_STREAM_RADIOBROWSER_API),
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
        label: i18n.global.tc('message.streaming.categories.all_countries'),
        code: config.STREAMING_CATEGORY_ALL
      }
    );
    forEach(state.countries, (value, key) => {
      if (key === 'FR') {
        countriesOptions.unshift(
          {
            label: value,
            code: key
          }
        );
      } else {
        countriesOptions.push(
          {
            label: value,
            code: key
          }
        );
      }
    });
    countriesOptions.unshift(
      {
        label: i18n.global.tc('message.streaming.categories.favorites'),
        code: config.STREAMING_CATEGORY_FAVORITES,
        disabled: state.favorites.length === 0
      }
    );

    return countriesOptions;
  },
  getOneStream: state => id => find(state.streamRadios, ['code_name', id]) || null,
  getCountryName: state => key => state.countries[key] || ''
};

// actions
const storeActions = {
  getConfig: ({ commit }) => {
    StreamsApi.getConfig()
      .then((data) => {
        cookies.set(config.COOKIE_STREAM_RADIOBROWSER_API, data.radio_browser_url);
        commit('setConfig', data);
      });
  },
  getCountries: ({ state, dispatch, commit }) => {
    commit('setLoading', true, { root: true });

    // use cache before network fetching
    /* if (cache.hasCache(config.CACHE_KEY_STREAM_COUNTRIES)) {
      commit('updateCountries', cache.getCache(config.CACHE_KEY_STREAM_COUNTRIES));
      dispatch('countrySelection', state.selectedCountry);
    }

    if (state.countries === []) {
      commit('setLoading', true, { root: true });
    } */

    nextTick(() => {
      StreamsApi.getCountries()
        .then(countries => commit('updateCountries', countries))
        .then(() => {
          if (state.selectedCountry === null) {
            dispatch('countrySelection', state.selectedCountry);
          }
        })
        .finally(() => commit('setLoading', false, { root: true }));
    });
  },
  getStreamRadio: ({ commit }, radioId) => {
    commit('setLoading', true, { root: true });

    nextTick(() => {
      StreamsApi.getRadios(radioId)
        .then(data => commit('updateStreamRadios', data))
        .finally(() => commit('setLoading', false, { root: true }));
    });
  },
  getStreamRadios: ({ state, commit }) => {
    commit('setLoading', true, { root: true });

    const offset = (state.page - 1) * config.STREAMS_DEFAULT_PER_PAGE;

    if (state.searchActive === true && state.searchText !== null) {
      nextTick(() => {
        StreamsApi.searchRadios(state.searchText, state.selectedCountry,
          state.selectedSortBy, offset)
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

    nextTick(() => {
      StreamsApi.getRadios(state.selectedCountry, state.selectedSortBy, offset)
        .then(data => commit('updateStreamRadios', data))
        .finally(() => commit('setLoading', false, { root: true }));
    });
  },
  setSoloExtended: ({ getters, dispatch, commit }, codeName) => {
    if (codeName !== null) {
      const streamIsLoaded = getters.getOneStream(codeName);

      if (streamIsLoaded === null) {
        dispatch('getStreamRadio', codeName);
      }
    }

    commit('setSoloExtended', codeName);
  },
  sendStreamsList: ({ state }) => {
    AndroidApi.list(state.streamRadios);
  },
  setStreamFavorites: ({ commit }, favorites) => {
    commit('setStreamFavorites', favorites);
  },

  /* eslint-disable no-param-reassign */
  countrySelection: ({ getters, dispatch, commit }, country, getAfter) => {
    // if country is just country_code
    if (typeof country !== 'object') {
      country = find(getters.countriesOptions, ['code', country.toUpperCase()])
        || { code: country, label: null };
      // if (country.label === null) {
      //   getAfter = false;
      // }
    }

    commit('setSelectedCountry', country.code.toUpperCase());
    cookies.set(config.COOKIE_STREAM_COUNTRY, country.code.toUpperCase());

    if (getAfter !== false) {
      nextTick(() => {
        dispatch('getStreamRadios');
      });
    }
  },
  pageSelection: ({ dispatch, commit }, page) => {
    commit('setPage', page);

    nextTick(() => {
      dispatch('getStreamRadios');
    });
  },
  sortBySelection: ({ dispatch, commit }, sortBy) => {
    commit('setSoloExtended', null);
    commit('setSelectedSortBy', sortBy);
    cookies.set(config.COOKIE_STREAM_SORT, sortBy);

    nextTick(() => {
      dispatch('getStreamRadios');
    });
  },
  playRandom: ({ state, dispatch, commit }) => {
    commit('setLoading', true, { root: true });

    nextTick(() => {
      StreamsApi.getRandom(state.selectedCountry)
        .then(data => dispatch('playStream', data))
        .finally(() => commit('setLoading', false, { root: true }));
    });
  },
  setSearchActive: ({ state, commit, dispatch }, status) => {
    commit('setSearchActive', status);

    if (status === false) {
      const oldText = state.searchText;

      commit('setSearchText', null);

      if (oldText !== null && oldText !== '') {
        nextTick(() => {
          dispatch('getStreamRadios');
        });
      }
    }
  },
  setSearchText: ({ commit }, text) => {
    if (text !== null && text.trim() !== '') {
      commit('setSoloExtended', null);
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
    state.streamRadios = data.streams;
    state.total = data.total;
  },
  updateCountries: (state, value) => {
    Object.freeze(value);
    state.countries = value;
  },
  setStreamFavorites: (state, value) => {
    if (state.favorites.length === 0) {
      state.favorites = value;
    }
  },
  setConfig: (state, data) => {
    Object.freeze(data);
    state.radioBrowserApi = data.radio_browser_url;
  },
  setSelectedCountry: (state, value) => {
    // preserve page if no actual change
    if (state.selectedCountry !== value) {
      state.selectedCountry = value;
      state.page = 1;
    }
  },
  setSelectedSortBy: (state, value) => {
    // preserve page if no actual change
    if (state.selectedSortBy !== value) {
      state.selectedSortBy = value;
      state.page = 1;
    }
  },
  setPage: (state, value) => {
    state.page = value;
  },
  setSearchActive: (state, status) => {
    state.searchActive = status;
  },
  setSearchText: (state, value) => {
    state.searchText = value;
  },
  setSearchLastTimestamp: (state, value) => {
    state.searchLastTimestamp = value;
  },
  setSoloExtended: (state, value) => {
    state.soloExtended = value;
  },
};

export default {
  state: initState,
  getters: storeGetters,
  actions: storeActions,
  mutations: storeMutations
};
