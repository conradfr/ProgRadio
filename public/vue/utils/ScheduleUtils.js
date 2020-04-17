import forEach from 'lodash/forEach';
import findIndex from 'lodash/findIndex';

import Vue from 'vue';
import * as config from '../config/config';

const moment = require('moment-timezone');

const VueCookie = require('vue-cookie');

Vue.use(VueCookie);

const enforceScrollIndex = (rawScrollIndex) => {
  if (rawScrollIndex < 0) {
    return 0;
  }

  const maxScroll = (config.MINUTE_PIXEL * 1440 * config.DAYS)
      - (window.innerWidth - 71) + config.GRID_VIEW_EXTRA;

  if (rawScrollIndex >= maxScroll) {
    return maxScroll;
  }

  return rawScrollIndex;
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
const getScheduleDisplay = (schedule, currentTime, initialScrollIndex) => {
  const startDay = moment(currentTime).tz(config.TIMEZONE).startOf('day');
  const result = {};

  forEach(schedule, (programs) => {
    forEach(programs, (program, key) => {
      const width = program.duration * config.MINUTE_PIXEL;
      const left = moment(program.start_at).tz(config.TIMEZONE).diff(startDay, 'minutes') * config.MINUTE_PIXEL;

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

const getCollectionIndex = (name, collections) => findIndex(collections, c => c.code_name === name);

const getNextCollection = (current, collections, way) => {
  const indexOfCurrentCollection = getCollectionIndex(current, collections);

  let newIndex = 0;
  if (way === 'backward') {
    newIndex = indexOfCurrentCollection === 0 ? collections.length - 1
      : indexOfCurrentCollection - 1;
  } else if (way === 'forward') {
    newIndex = collections.length === (indexOfCurrentCollection + 1) ? 0
      : indexOfCurrentCollection + 1;
  }

  return collections[newIndex].code_name;
};

const initCurrentCollection = (collections) => {
  let param = null;
  // test if url api is supported (IE ...)
  if (typeof URLSearchParams !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('c')) {
      param = urlParams.get('c');
      // collection does not exist
      if (getCollectionIndex(param, collections) === -1) {
        param = null;
      } else {
        setTimeout(() => {
          Vue.cookie.set(config.COOKIE_COLLECTION, param, { expires: config.COOKIE_TTL });
        }, 300);
      }
    }
  }

  if (param === null) {
    param = Vue.cookie.get(config.COOKIE_COLLECTION);
  }

  return param || config.DEFAULT_COLLECTION;
};

export default {
  enforceScrollIndex,
  initialScrollIndexFunction,
  getUpdatedProgramText,
  getScheduleDisplay,
  initCurrentCollection,
  getCollectionIndex,
  getNextCollection
};
