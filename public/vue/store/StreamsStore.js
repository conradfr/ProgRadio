import Vue from 'vue';

import forEach from 'lodash/forEach';

import { STREAMS_DEFAULT_PER_PAGE } from '../config/config';

import * as config from '../config/config';
import StreamsApi from '../api/StreamsApi';

const VueCookie = require('vue-cookie');

Vue.use(VueCookie);

const sortBySelect = [
  {
    code: 'name',
    label: 'Par ordre alphabétique'
  },
  {
    code: 'popularity',
    label: 'Par popularité'
  },
  {
    code: 'random',
    label: 'Par ordre aléatoire'
  },
];

// initial state
const initState = {
  countries: [],
  selectedCountry: Vue.cookie.get(config.COOKIE_STREAM_COUNTRY)
    ? JSON.parse(Vue.cookie.get(config.COOKIE_STREAM_COUNTRY)) : { code: 'FR', label: 'France' },
  radios: [],
  selectedSortBy: Vue.cookie.get(config.COOKIE_STREAM_SORT)
    ? JSON.parse(Vue.cookie.get(config.COOKIE_STREAM_SORT)) : sortBySelect[0],
  sortBy: sortBySelect,
  total: 0,
  page: 1
};

// getters
const storeGetters = {
  countriesOptions: (state) => {
    const countriesOptions = [];
    countriesOptions.push(
      {
        label: 'Tous les pays',
        code: 'all'
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
  getCountries: ({ commit }) => {
    commit('setLoading', true, { root: true });

    Vue.nextTick(() => {
      StreamsApi.getCountries()
        .then(countries => commit('updateCountries', countries))
        .then(() => commit('setLoading', false, { root: true }));
    });
  },
  getRadios: ({ state, commit }) => {
    commit('setLoading', true, { root: true });

    const offset = (state.page - 1) * STREAMS_DEFAULT_PER_PAGE;

    Vue.nextTick(() => {
      StreamsApi.getRadios(state.selectedCountry.code, state.selectedSortBy.code, offset)
        .then(data => commit('updateRadios', data))
        .then(() => commit('setLoading', false, { root: true }));
    });
  },
  countrySelection: ({ dispatch, commit }, country) => {
    commit('setSelectedCountry', country);
    Vue.cookie.set(config.COOKIE_STREAM_COUNTRY,
      JSON.stringify(country), config.COOKIE_PARAMS);

    Vue.nextTick(() => {
      dispatch('getRadios');
    });
  },
  pageSelection: ({ dispatch, commit }, page) => {
    commit('setPage', page);

    Vue.nextTick(() => {
      dispatch('getRadios');
    });
  },
  sortBySelection: ({ dispatch, commit }, sortBy) => {
    commit('setSelectedSortBy', sortBy);
    Vue.cookie.set(config.COOKIE_STREAM_SORT,
      JSON.stringify(sortBy), config.COOKIE_PARAMS);

    Vue.nextTick(() => {
      dispatch('getRadios');
    });
  },
  playRandom: ({ state, dispatch, commit }) => {
    commit('setLoading', true, { root: true });

    Vue.nextTick(() => {
      StreamsApi.getRandom(state.selectedCountry.code)
        .then(data => dispatch('playStream', data))
        .then(() => commit('setLoading', false, { root: true }));
    });
  }
};

// mutations
const storeMutations = {
  updateRadios: (state, data) => {
    Object.freeze(data.streams);
    Vue.set(state, 'radios', data.streams);
    Vue.set(state, 'total', data.total);
  },
  updateCountries: (state, value) => {
    Object.freeze(value);
    Vue.set(state, 'countries', value);
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
  }
};

export default {
  state: initState,
  getters: storeGetters,
  actions: storeActions,
  mutations: storeMutations
};
