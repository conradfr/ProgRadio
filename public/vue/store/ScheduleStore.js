import Vue from 'vue';

import without from 'lodash/without';
import forEach from 'lodash/forEach';
import find from 'lodash/find';
import findIndex from 'lodash/findIndex';
import compose from 'lodash/fp/compose';
import filter from 'lodash/fp/filter';
import map from 'lodash/fp/map';

import * as config from '../config/config';

import ScheduleApi from '../api/ScheduleApi';
import ScheduleUtils from '../utils/ScheduleUtils';

const moment = require('moment-timezone');

const VueCookie = require('vue-cookie');

Vue.use(VueCookie);

const cursorTime = moment().tz(config.TIMEZONE);

const initialScrollIndex = ScheduleUtils.initialScrollIndexFunction(cursorTime);

/* eslint-disable no-undef */
// radios.forEach(Object.freeze);
categories.forEach(Object.freeze);
collections.forEach(Object.freeze);

// initial state
const initState = {
  radios,
  categories,
  collections,
  schedule: {},
  scheduleDisplay: {},
  cursorTime,
  scrollIndex: initialScrollIndex,
  scrollClick: false,
  loading: false,
  currentCollection: ScheduleUtils.initCurrentCollection(collections),
  categoriesExcluded: Vue.cookie.get(config.COOKIE_EXCLUDE)
    ? Vue.cookie.get(config.COOKIE_EXCLUDE).split('|') : [],
  categoryFilterFocus: {
    icon: false,
    list: false
  }
};

// getters
const storeGetters = {
  hasSchedule: state => Object.keys(state.schedule).length > 0,
  cursorIndex: (state) => {
    const startDay = moment(state.cursorTime).startOf('day');
    const newIndex = state.cursorTime.diff(startDay, 'minutes') * config.MINUTE_PIXEL + 1;

    return `${newIndex}px`;
  },
  isToday: (state) => {
    const now = moment().tz(config.TIMEZONE);
    return state.cursorTime.isSame(now, 'day');
  },
  isTomorrow: (state) => {
    const tomorrow = moment().add(1, 'day').tz(config.TIMEZONE);
    return tomorrow.diff(state.cursorTime, 'days') === 0;
  },
  gridIndexLeft: state => ({ left: `-${state.scrollIndex}px` }),
  gridIndexTransform: state => ({ transform: `translateX(-${state.scrollIndex}px)` }),
  radiosRanked: (state) => {
    const index = ScheduleUtils.getCollectionIndex(state.currentCollection, state.collections);
    return ScheduleUtils.rankCollection(state.collections[index],
      state.radios, state.categoriesExcluded);
  },
  displayCategoryFilter: state => state.categoryFilterFocus.icon
    || state.categoryFilterFocus.list || false,
  currentShowOnRadio: state => (radioCodename) => {
    const currentShow = find(state.schedule[radioCodename], (show) => {
      if (state.cursorTime.isBetween(moment(show.start_at), moment(show.end_at))) {
        return true;
      }

      return false;
    });

    return typeof currentShow === 'undefined' ? null : currentShow;
  }
};

// actions
const storeActions = {

  // ---------- SCROLL ----------

  scrollToCursor: ({ state, commit }) => {
    commit('scrollSet', ScheduleUtils.initialScrollIndexFunction(state.cursorTime));
    commit('updateDisplayData');
  },
  scroll: ({ commit }, x) => {
    commit('scrollTo', x);
    commit('updateDisplayData');
  },
  scrollBackward: ({ commit }) => {
    commit('scrollTo', (-1 * config.NAV_MOVE_BY));
    commit('updateDisplayData');
  },
  scrollForward: ({ commit }) => {
    commit('scrollTo', config.NAV_MOVE_BY);
    commit('updateDisplayData');
  },
  scrollClick: ({ commit }, value) => {
    commit('scrollClickSet', value);
    commit('updateDisplayData');
  },

  // ---------- COLLECTIONS ----------

  collectionBackward: ({ state, commit }) => {
    commit('collectionSwitch',
      ScheduleUtils.getNextCollection(state.currentCollection, state.collections, state.radios, 'backward'));
  },
  collectionForward: ({ state, commit }) => {
    commit('collectionSwitch',
      ScheduleUtils.getNextCollection(state.currentCollection, state.collections, state.radios, 'forward'));
  },
  switchCollection: ({ commit }, collection) => {
    commit('collectionSwitch', collection);
  },

  // ---------- FAVORITES ----------

  toggleFavorites: ({ commit }, radio) => {
    commit('toggleFavorites', radio);
  },

  // ---------- CATEGORY ----------

  categoryFilterFocus: ({ commit }, params) => {
    commit('setCategoryFilterFocus', params);
  },
  toggleExcludeCategory: ({ commit }, category) => {
    commit('toggleExcludeCategory', category);
  },

  // ---------- CALENDAR ----------

  calendarToday: ({ commit, dispatch }) => {
    const newDate = moment().tz(config.TIMEZONE);
    commit('updateCursor', newDate);

    Vue.nextTick(() => {
      dispatch('getSchedule');
    });
  },
  // calendarBackward: ({ state, commit, dispatch }) => {
  calendarBackward: ({ state, commit, dispatch }) => {
    const newDate = moment(state.cursorTime).subtract(1, 'days');
    commit('updateCursor', newDate);

    Vue.nextTick(() => {
      dispatch('getSchedule');
    });
  },
  calendarForward: ({ state, commit, dispatch }) => {
    const newDate = moment(state.cursorTime).add(1, 'days');
    commit('updateCursor', newDate);

    Vue.nextTick(() => {
      dispatch('getSchedule');
    });
  },

  // ---------- SCHEDULE ----------

  getSchedule: ({ state, commit }) => {
    const dateStr = state.cursorTime.format('YYYY-MM-DD');

    // If we have cache we display it immediately and then fetch an update silently
    if (ScheduleApi.hasCache(dateStr)) {
      commit('updateSchedule', ScheduleApi.getCache(dateStr));
    } else {
      commit('setLoading', true);
    }

    Vue.nextTick(() => {
      ScheduleApi.getSchedule(dateStr, baseUrl)
        .then(schedule => commit('updateSchedule', schedule))
        .then(() => commit('setLoading', false));
    });
  },
  /* eslint-disable object-curly-newline */
  tick: ({ commit, getters, rootState, dispatch }) => {
    const now = moment().tz(config.TIMEZONE);

    if (now.hour() === 0 && now.minutes() === 3) {
      dispatch('getSchedule');
    }

    if (rootState.player.playing === true) {
      const { radio } = rootState.player;
      const show = getters.currentShowOnRadio(radio.code_name);
      commit('switchRadio', { radio, show });
    }

    commit('updateCursor', now);
  }
};

// mutations
const storeMutations = {
  updateDisplayData(state) {
    if (state.scrollClick === true) {
      return;
    }

    const update = ScheduleUtils.getUpdatedProgramText(state);

    forEach(update, (data, key) => {
      Vue.set(state.scheduleDisplay[key], 'textLeft', data);
    });
  },
  scrollSet(state, x) {
    Vue.set(state, 'scrollIndex', x);
  },
  scrollTo(state, x) {
    const newIndex = state.scrollIndex + x;
    Vue.set(state, 'scrollIndex', ScheduleUtils.enforceScrollIndex(newIndex));
  },
  updateCursor(state, value) {
    Vue.set(state, 'cursorTime', value);
  },
  scrollClickSet: (state, value) => {
    Vue.set(state, 'scrollClick', value);
  },
  collectionSwitch(state, collection) {
    Vue.set(state, 'currentCollection', collection);

    setTimeout(() => {
      Vue.cookie.set(config.COOKIE_COLLECTION, collection, { expires: config.COOKIE_TTL });
    }, 300);
  },
  toggleFavorites(state, radioId) {
    const index = findIndex(state.radios, r => r.code_name === radioId);
    const updatedRadio = Object.assign({}, state.radios[index]);

    // Is favorite
    const favoriteIndex = updatedRadio.collection.indexOf(config.COLLECTION_FAVORITES);
    if (updatedRadio.collection.indexOf(config.COLLECTION_FAVORITES) !== -1) {
      updatedRadio.collection.splice(favoriteIndex, 1);
      Vue.set(state.radios, index, updatedRadio);
      // Vue.delete(state.radios[index].collection, favoriteIndex);
    } else {
      updatedRadio.collection.push(config.COLLECTION_FAVORITES);
      Vue.set(state.radios, index, updatedRadio);
    }

    setTimeout(() => {
      const favorites = compose(
        map(entry => entry.code_name),
        filter(entry => entry.collection.indexOf(config.COLLECTION_FAVORITES) !== -1)
      )(state.radios);

      Vue.cookie.set(config.COOKIE_FAVORITES, favorites.join('|'),
        { expires: config.COOKIE_TTL });
    }, 500);
  },
  setCategoryFilterFocus(state, params) {
    state.categoryFilterFocus[params.element] = params.status;
  },
  toggleExcludeCategory(state, category) {
    if (state.categoriesExcluded.indexOf(category) === -1) {
      state.categoriesExcluded.push(category);
    } else {
      Vue.set(state, 'categoriesExcluded', without(state.categoriesExcluded, category));
    }

    setTimeout(() => {
      Vue.cookie.set(config.COOKIE_EXCLUDE, state.categoriesExcluded.join('|'),
        { expires: config.COOKIE_TTL });
    }, 500);
  },
  setLoading: (state, value) => {
    Vue.set(state, 'loading', value);
  },
  updateSchedule: (state, value) => {
    const scheduleDisplay = ScheduleUtils.getScheduleDisplay(
      value, state.cursorTime, initialScrollIndex
    );

    Object.freeze(value);
    Vue.set(state, 'schedule', value);
    Vue.set(state, 'scheduleDisplay', scheduleDisplay);
  }
};

export default {
  state: initState,
  getters: storeGetters,
  actions: storeActions,
  mutations: storeMutations
};
