import Vue from 'vue';

import axios from 'axios';

import orderBy from 'lodash/fp/orderBy';
import filter from 'lodash/fp/filter';
import compose from 'lodash/fp/compose';
import without from 'lodash/without';
import forEach from 'lodash/forEach';

import * as config from '../config/config';

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

const initialScrollIndexFunction = () => {
  const hourPixels = config.MINUTE_PIXEL * 60;
  let reduceToHour = 0;
  const now = moment().tz(config.TIMEZONE);

  if (window.innerWidth > (hourPixels + (config.MINUTE_PIXEL * 30))) {
    reduceToHour = Math.abs(Math.floor(window.innerWidth / config.GRID_INDEX_BREAK));
  } else {
    const minutes = now.minute();
    if (minutes < 15) {
      reduceToHour = 0.25;
    } else if (minutes > 45) {
      reduceToHour = -0.5;
    }
  }

  return enforceScrollIndex((now.hours() - reduceToHour) * hourPixels + 1);
};

const initialScrollIndex = initialScrollIndexFunction();

const cursorTime = moment().tz(config.TIMEZONE);

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
const getScheduleDisplay = () => {
  const startDay = moment().startOf('day');
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

/* eslint-disable no-undef */
const ScheduleStore = {
  state: {
    radios,
    categories,
    schedule,
    scheduleDisplay: getScheduleDisplay(),
    cursorTime,
    scrollIndex: initialScrollIndex,
    scrollClick: false,
    categoriesExcluded: Vue.cookie.get(COOKIE_EXCLUDE)
      ? Vue.cookie.get(COOKIE_EXCLUDE).split('|') : [],
    categoryFilterFocus: {
      icon: false,
      list: false
    }
  },
  getters: {
    cursorIndex: (state) => {
      const startDay = moment().tz(config.TIMEZONE).startOf('day');
      const newIndex = state.cursorTime.diff(startDay, 'minutes') * config.MINUTE_PIXEL + 1;
      return `${newIndex}px`;
    },
    gridIndexLeft: state => ({ left: `-${state.scrollIndex}px` }),
    gridIndexTransform: state => ({ transform: `translateX(-${state.scrollIndex}px)` }),
    // sort by share, desc
    radiosRanked: state => compose(
      orderBy(['share'], ['desc']),
      filter(entry => state.categoriesExcluded.indexOf(entry.category) === -1)
    )(state.radios),
    displayCategoryFilter: state => state.categoryFilterFocus.icon
      || state.categoryFilterFocus.list || false
  },
  mutations: {
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
    updateCursor(state) {
      state.cursorTime = moment().tz(config.TIMEZONE);
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
    updateSchedule: (state, value) => {
      Vue.set(state, 'schedule', value);
    }
  },
  actions: {
    scrollToCursor: ({ commit }) => {
      commit('scrollSet', initialScrollIndexFunction());
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
    tick: ({ commit }) => {
      const now = moment().tz(config.TIMEZONE);

      if (now.hour() === 0 && now.minutes() === 5) {
        axios.get(`${baseUrl}schedule`).then((response) => {
          commit('updateSchedule', response.data.schedule);
        });
      }

      commit('updateCursor');
    }
  }
};

export default ScheduleStore;
