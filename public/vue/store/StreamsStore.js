import { nextTick } from 'vue';

import forEach from 'lodash/forEach';
import find from 'lodash/find';

import * as config from '../config/config';
import i18n from '../lang/i18n';
import cookies from '../utils/cookies';
import StreamsApi from '../api/StreamsApi';
import AndroidApi from '../api/AndroidApi';

const sortBySelect = [
  {
    code: 'name',
    label: i18n.global.tc('message.streaming.sort.name')
  },
  {
    code: 'popularity',
    label: i18n.global.tc('message.streaming.sort.popularity')
  },
  {
    code: 'random',
    label: i18n.global.tc('message.streaming.sort.random')
  },
];

// initial state
/* eslint-disable no-undef */
const initState = {
  countries: [],
  favorites: [],
  selectedCountry: cookies.getJson(config.COOKIE_STREAM_COUNTRY, config.STREAMING_DEFAULT_COUNTRY),
  streamRadios: [],
  selectedSortBy: cookies.getJson(config.COOKIE_STREAM_SORT, sortBySelect[1]),
  radioBrowserApi: cookies.get(config.COOKIE_STREAM_RADIOBROWSER_API),
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
        code: config.STREAMING_CATEGORY_FAVORITES
      }
    );

    return countriesOptions;
  }
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

    nextTick(() => {
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
  getStreamRadio: ({ commit }, radioId) => {
    commit('setLoading', true, { root: true });

    commit('setPage', 0);
    commit('setSelectedCountry', {
      label: i18n.global.tc('message.streaming.categories.all_countries'),
      code: config.STREAMING_CATEGORY_ALL
    });

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

    nextTick(() => {
      StreamsApi.getRadios(state.selectedCountry.code, state.selectedSortBy.code, offset)
        .then(data => commit('updateStreamRadios', data))
        .finally(() => commit('setLoading', false, { root: true }));
    });
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
      if (country.label === null) {
        getAfter = false;
      }
    }

    commit('setSelectedCountry', country);
    cookies.set(config.COOKIE_STREAM_COUNTRY, country);

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
    commit('setSelectedSortBy', sortBy);
    cookies.set(config.COOKIE_STREAM_SORT, sortBy);

    nextTick(() => {
      dispatch('getStreamRadios');
    });
  },
  playRandom: ({ state, dispatch, commit }) => {
    commit('setLoading', true, { root: true });

    nextTick(() => {
      StreamsApi.getRandom(state.selectedCountry.code)
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
    state.favorites = value;
  },
  setConfig: (state, data) => {
    Object.freeze(data);
    state.radioBrowserApi = data.radio_browser_url;
  },
  setSelectedCountry: (state, value) => {
    state.selectedCountry = value;
    state.page = 1;
  },
  setSelectedSortBy: (state, value) => {
    state.selectedSortBy = value;
    state.page = 1;
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
  }
};

export default {
  state: initState,
  getters: storeGetters,
  actions: storeActions,
  mutations: storeMutations
};
