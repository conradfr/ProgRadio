import Vue from 'vue';

import orderBy from 'lodash/fp/orderBy';
import filter from 'lodash/fp/filter';
import compose from 'lodash/fp/compose';
import without from 'lodash/without';
import forEach from 'lodash/forEach';
import find from 'lodash/find';

import * as config from '../config/config';

import ScheduleApi from '../api/ScheduleApi';

const moment = require('moment-timezone');

const VueCookie = require('vue-cookie');

Vue.use(VueCookie);

const COOKIE_EXCLUDE = `${config.COOKIE_PREFIX}-exclude`;

const enforceScrollIndex = (rawScrollIndex) => {
  let scrollIndex = rawScrollIndex;
  if (scrollIndex < 0) {
    scrollIndex = 0;
  } else {
    const maxScroll = (config.MINUTE_PIXEL * 1440 * config.DAYS)
      - (window.innerWidth - 71) + config.GRID_VIEW_EXTRA;
    if (scrollIndex >= maxScroll) {
      scrollIndex = maxScroll;
    }
  }

  return scrollIndex;
};

const initialScrollIndexFunction = (currentDateTime) => {
  const hourPixels = config.MINUTE_PIXEL * 60;
  let reduceToHour = 0;

  if (window.innerWidth > (hourPixels + (config.MINUTE_PIXEL * 30))) {
    reduceToHour = Math.abs(Math.floor(window.innerWidth / config.GRID_INDEX_BREAK));
  } else {
    const minutes = currentDateTime.minute();
    if (minutes < 15) {
      reduceToHour = 0.25;
    } else if (minutes > 45) {
      reduceToHour = -0.5;
    }
  }

  return enforceScrollIndex((currentDateTime.hours() - reduceToHour) * hourPixels + 1);
};

const cursorTime = moment().tz(config.TIMEZONE);
// cursorTime.subtract(1, 'days');

const initialScrollIndex = initialScrollIndexFunction(cursorTime);

const updatedProgramTextCalc = (schedule, scheduleDisplay, scrollIndex) => {
  const update = {};

  forEach(schedule, (programs) => {
    forEach(programs, (program, key) => {
      let left = 0;

      if (scheduleDisplay[key].container.left < scrollIndex
        && (scheduleDisplay[key].container.left + scheduleDisplay[key].container.width)
              > scrollIndex) {
        left = scrollIndex - scheduleDisplay[key].container.left;
      }

      if (left !== scheduleDisplay[key].textLeft) {
        update[key] = left;
      }
    });
  });

  return update;
};

const getUpdatedProgramText = (state) => {
  const {
    schedule,
    scheduleDisplay,
    scrollIndex
  } = state;

  return updatedProgramTextCalc(schedule, scheduleDisplay, scrollIndex);
};

/* eslint-disable no-undef */
const getScheduleDisplay = (schedule, currentTime) => {
  const startDay = moment(currentTime).startOf('day');
  const result = {};

  forEach(schedule, (programs) => {
    forEach(programs, (program, key) => {
      const width = program.duration * config.MINUTE_PIXEL;
      const left = moment(program.start_at).diff(startDay, 'minutes') * config.MINUTE_PIXEL;

      result[key] = {
        container: {
          left,
          width,
        },
        textLeft: 0
      };
    });
  });

  const updatedProgramText = updatedProgramTextCalc(schedule, result, initialScrollIndex);

  forEach(updatedProgramText, (data, key) => {
    result[key].textLeft = data;
  });

  return result;
};

// initial state
const initState = {
  radios,
  categories,
  schedule: {},
  scheduleDisplay: {},
  cursorTime,
  scrollIndex: initialScrollIndex,
  scrollClick: false,
  loading: false,
  categoriesExcluded: Vue.cookie.get(COOKIE_EXCLUDE)
    ? Vue.cookie.get(COOKIE_EXCLUDE).split('|') : [],
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
  gridIndexLeft: state => ({ left: `-${state.scrollIndex}px` }),
  gridIndexTransform: state => ({ transform: `translateX(-${state.scrollIndex}px)` }),
  // sort by share, desc
  radiosRanked: state => compose(
    orderBy(['share'], ['desc']),
    filter(entry => state.categoriesExcluded.indexOf(entry.category) === -1)
  )(state.radios),
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
  scrollToCursor: ({ state, commit }) => {
    commit('scrollSet', initialScrollIndexFunction(state.cursorTime));
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
  categoryFilterFocus: ({ commit }, params) => {
    commit('setCategoryFilterFocus', params);
  },
  toggleExcludeCategory: ({ commit }, category) => {
    commit('toggleExcludeCategory', category);
  },
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
  getSchedule: ({ state, commit }) => {
    const dateStr = state.cursorTime.format('YYYY-MM-DD');

    // If we have cache we display it immediately and then fetch an update silently
    if (ScheduleApi.hasCache(dateStr)) {
      commit('updateSchedule', ScheduleApi.getCache(dateStr));
    } else {
      commit('setLoading', true);
    }

    Vue.nextTick(() => {
      ScheduleApi.getSchedule(dateStr)
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

    const update = getUpdatedProgramText(state);

    forEach(update, (data, key) => {
      state.scheduleDisplay[key].textLeft = data;
    });
  },
  scrollSet(state, x) {
    state.scrollIndex = x;
  },
  scrollTo(state, x) {
    const newIndex = state.scrollIndex + x;
    state.scrollIndex = enforceScrollIndex(newIndex);
  },
  updateCursor(state, value) {
    Vue.set(state, 'cursorTime', value);
  },
  scrollClickSet: (state, value) => {
    state.scrollClick = value;
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

    Vue.cookie.set(COOKIE_EXCLUDE, state.categoriesExcluded.join('|'),
      { expires: config.COOKIE_TTL });
  },
  setLoading: (state, value) => {
    state.loading = value;
  },
  updateSchedule: (state, value) => {
    const scheduleDisplay = getScheduleDisplay(value, state.cursorTime);
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
