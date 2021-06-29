import without from 'lodash/without';
import pick from 'lodash/pick';
import forEach from 'lodash/forEach';
import find from 'lodash/find';
import sortBy from 'lodash/sortBy';

import { DateTime, Interval } from 'luxon';

import { nextTick } from 'vue';

import * as config from '../config/config';
import cache from '../utils/cache';
import cookies from '../utils/cookies';

import router from '../router/router';
import ScheduleApi from '../api/ScheduleApi';
import ScheduleUtils from '../utils/ScheduleUtils';
import AndroidApi from '../api/AndroidApi';

const cursorTime = DateTime.local().setZone(config.TIMEZONE);

const initialScrollIndex = ScheduleUtils.initialScrollIndexFunction(cursorTime);

// initial state
const initState = {
  radios: cache.hasCache(config.CACHE_KEY_RADIOS)
    ? cache.getCache(config.CACHE_KEY_RADIOS) : [],
  categories: cache.hasCache(config.CACHE_KEY_CATEGORIES)
    ? Object.freeze(cache.getCache(config.CACHE_KEY_CATEGORIES)) : [],
  collections: cache.hasCache(config.CACHE_KEY_COLLECTIONS)
    ? Object.freeze(cache.getCache(config.CACHE_KEY_COLLECTIONS)) : {},
  schedule: {},
  scheduleDisplay: {},
  cursorTime,
  scrollIndex: initialScrollIndex,
  scrollClick: false,
  currentCollection: cookies.get(config.COOKIE_COLLECTION, config.DEFAULT_COLLECTION),
  categoriesExcluded: cookies.has(config.COOKIE_EXCLUDE)
    ? cookies.get(config.COOKIE_EXCLUDE).split('|') : [],
  categoryFilterFocus: {
    icon: false,
    list: false
  }
};

// getters
const storeGetters = {
  hasSchedule: state => Object.keys(state.schedule).length > 0,
  cursorIndex: (state) => {
    const startDay = state.cursorTime.startOf('day');
    const newIndex = state.cursorTime.diff(startDay).as('minutes') * config.MINUTE_PIXEL + 1;

    return `${newIndex}px`;
  },
  isToday: (state) => {
    const now = DateTime.local().setZone(config.TIMEZONE);
    return state.cursorTime.hasSame(now, 'day');
  },
  isTomorrow: (state) => {
    const tomorrow = DateTime.local().plus({ days: 1 }).setZone(config.TIMEZONE);
    return Math.floor(tomorrow.diff(state.cursorTime).as('days')) === 0;
  },
  gridIndexLeft: state => ({ left: `-${state.scrollIndex}px` }),
  gridIndexTransform: state => ({ transform: `translateX(-${state.scrollIndex}px)` }),
  rankedCollections: state => sortBy(state.collections, 'priority'),
  rankedRadios: (state) => {
    if (Object.keys(state.collections).length === 0
      || state.collections[state.currentCollection] === undefined) {
      return [];
    }

    const radios = pick(state.radios, state.collections[state.currentCollection].radios);

    return ScheduleUtils.rankCollection(state.collections[state.currentCollection],
      radios, state.categoriesExcluded);
  },
  isFavorite: state => radioCodeName => state.collections[config.COLLECTION_FAVORITES] !== undefined
      && state.collections[config.COLLECTION_FAVORITES].radios.indexOf(radioCodeName) !== -1,
  displayCategoryFilter: state => state.categoryFilterFocus.icon
    || state.categoryFilterFocus.list || false,
  currentShowOnRadio: state => (radioCodename) => {
    const currentShow = find(state.schedule[radioCodename], show => Interval
      .fromDateTimes(DateTime.fromISO(show.start_at).setZone(config.TIMEZONE),
        DateTime.fromISO(show.end_at).setZone(config.TIMEZONE)).contains(state.cursorTime));

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

  collectionBackward: ({ state }) => {
    const nextCollection = ScheduleUtils.getNextCollection(
      state.currentCollection,
      state.collections,
      state.radios,
      'backward'
    );

    router.push({ name: 'schedule', params: { collection: nextCollection } });
  },
  collectionForward: ({ state }) => {
    const nextCollection = ScheduleUtils.getNextCollection(
      state.currentCollection,
      state.collections,
      state.radios,
      'forward'
    );

    router.push({ name: 'schedule', params: { collection: nextCollection } });
  },
  switchCollection: ({ commit }, collection) => {
    commit('collectionSwitch', collection);
  },
  setFavoritesCollection: ({ commit }, radios) => {
    commit('setFavoritesCollection', radios);
  },
  sendRadiosList: ({ state }) => {
    if (state.collections === null || state.collections.length === 0
        || state.currentCollection === null) {
      return;
    }

    const collectionToIterateOn = find(state.collections,
      { code_name: state.currentCollection });
    const radios = ScheduleUtils.rankCollection(collectionToIterateOn,
      state.radios, state.categoriesExcluded);

    AndroidApi.list(radios);
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
    const newDate = DateTime.local().setZone(config.TIMEZONE);
    commit('updateCursor', newDate);

    nextTick(() => {
      dispatch('getSchedule');
    });
  },
  // calendarBackward: ({ state, commit, dispatch }) => {
  calendarBackward: ({ state, commit, dispatch }) => {
    const newDate = state.cursorTime.minus({ days: 1 });
    commit('updateCursor', newDate);

    nextTick(() => {
      dispatch('getSchedule');
    });
  },
  calendarForward: ({ state, commit, dispatch }) => {
    const newDate = state.cursorTime.plus({ days: 1 });
    commit('updateCursor', newDate);

    nextTick(() => {
      dispatch('getSchedule');
    });
  },

  // ---------- DATA & SCHEDULE ----------

  /* eslint-disable no-undef */
  getRadiosData: ({ dispatch, state, commit }) => {
    setTimeout(
      () => {
        ScheduleApi.getRadiosData()
          .then(({ radios, collections, categories }) => {
            commit('updateRadios', radios);
            commit('updateCollections', collections);
            commit('updateCategories', categories);
            dispatch('syncRadioFavorites');
          })
          .finally(() => commit('setLoading', false, { root: true }));
      },
      30
    );

    if (state.radios === []) {
      commit('setLoading', true, { root: true });
    }
  },
  getSchedule: ({ state, commit }, params) => {
    const dateStr = state.cursorTime.toISODate();

    // if we have cache we display it immediately and then fetch an update silently
    if (cache.hasCache(dateStr)) {
      commit('updateSchedule', cache.getCache(dateStr));
    } else {
      commit('setLoading', true, { root: true });
    }

    if (params !== undefined && params !== null && params !== '') {
      // api don't have user favorites access
      /* eslint-disable no-param-reassign */
      if (params.collection !== undefined && params.collection === config.COLLECTION_FAVORITES) {
        params.radios = state.collections[config.COLLECTION_FAVORITES].radios;
        delete params.collection;
      }

      setTimeout(
        () => {
          ScheduleApi.getSchedule(dateStr, params)
            .then(schedule => commit('updateSchedule', schedule))
            .finally(() => commit('setLoading', false, { root: true }))
            .then(() => {
            /*              setTimeout(
                () => {
                  ScheduleApi.getSchedule(dateStr)
                    .then(schedule => commit('updateSchedule', schedule));
                },
                1000
              ); */
            });
        },
        75
      );
    } else {
      if (cache.hasCache(dateStr)) {
        commit('updateSchedule', cache.getCache(dateStr));
      }

      setTimeout(
        () => {
          ScheduleApi.getSchedule(dateStr)
            .then(schedule => commit('updateSchedule', schedule))
            .finally(() => commit('setLoading', false, { root: true }));
        },
        75
      );
    }
  },
  /* eslint-disable object-curly-newline */
  tick: ({ commit, rootState, dispatch }) => {
    const now = DateTime.local().setZone(config.TIMEZONE);

    if (now.hour === 0 && now.minutes < 3) {
      dispatch('getSchedule');
    }

    if (rootState.player.playing === true && rootState.player.radio !== null
      && rootState.player.radio.type === config.PLAYER_TYPE_RADIO) {
      dispatch('updateShow');
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
      state.scheduleDisplay[key].textLeft = data;
    });
  },
  scrollSet(state, x) {
    state.scrollIndex = x;
  },
  scrollTo(state, x) {
    const newIndex = state.scrollIndex + x;
    state.scrollIndex = ScheduleUtils.enforceScrollIndex(newIndex);
  },
  updateCursor(state, value) {
    state.cursorTime = value;
  },
  scrollClickSet: (state, value) => {
    state.scrollClick = value;
  },
  collectionSwitch(state, collection) {
    state.currentCollection = collection;

    setTimeout(() => {
      cookies.set(config.COOKIE_COLLECTION, collection);
    }, 300);
  },
  setFavoritesCollection(state, radios) {
    if (state.collections[config.COLLECTION_FAVORITES] === undefined) {
      return;
    }

    state.collections[config.COLLECTION_FAVORITES].radios = radios || [];
  },
  setCategoryFilterFocus(state, params) {
    state.categoryFilterFocus[params.element] = params.status;
  },
  toggleExcludeCategory(state, category) {
    if (state.categoriesExcluded.indexOf(category) === -1) {
      state.categoriesExcluded.push(category);
    } else {
      state.categoriesExcluded = without(state.categoriesExcluded, category);
    }

    setTimeout(() => {
      cookies.set(config.COOKIE_EXCLUDE, state.categoriesExcluded.join('|'));
    }, 500);
  },
  updateSchedule: (state, value) => {
    const updatedSchedule = { ...{ ...state.schedule }, ...value };
    const scheduleDisplay = ScheduleUtils.getScheduleDisplay(
      updatedSchedule, state.cursorTime, initialScrollIndex
    );

    Object.freeze(updatedSchedule);
    state.schedule = updatedSchedule;
    state.scheduleDisplay = scheduleDisplay;
  },
  updateRadios: (state, value) => {
    state.radios = value;
  },
  updateCollections: (state, collections) => {
    forEach(collections, (collection, key) => {
      if (key !== config.COLLECTION_FAVORITES) {
        Object.freeze(collection);
      }
    });

    state.collections = collections;
  },
  updateCategories: (state, value) => {
    Object.freeze(value);
    state.categories = value;
  }
};

export default {
  state: initState,
  getters: storeGetters,
  actions: storeActions,
  mutations: storeMutations
};
