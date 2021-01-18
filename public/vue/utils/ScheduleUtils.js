import forEach from 'lodash/forEach';
import sortBy from 'lodash/sortBy';
import findIndex from 'lodash/findIndex';

import Vue from 'vue';
import compose from 'lodash/fp/compose';
import filter from 'lodash/fp/filter';
import orderBy from 'lodash/fp/orderBy';

import { DateTime } from 'luxon';

import * as config from '../config/config';

const VueCookie = require('vue-cookie');

Vue.use(VueCookie);

/* ---------- GRID---------- */

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
    const minutes = currentDateTime.minute;
    if (minutes < 15) {
      reduceToHour = 0.25;
    } else if (minutes > 45) {
      reduceToHour = -0.5;
    }
  }

  return enforceScrollIndex((currentDateTime.hour - reduceToHour) * hourPixels + 1);
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
  const startDay = currentTime.startOf('day');
  /* we use midnight next day as "end of current day",
     as shows usually ends a midnight next day and not 23:59:59 */
  const endDay = currentTime.plus({ days: 1 }).startOf('day');
  const result = {};

  forEach(schedule, (programs) => {
    forEach(programs, (program, key) => {
      let width = config.MINUTE_PIXEL;
      // @todo I guess we'll look at shows that start prev day and ends next day later ...
      if (program.end_overflow) {
        width *= endDay.diff(DateTime.fromSQL(program.start_at).setZone(config.TIMEZONE))
          .as('minutes');
      } else if (program.start_overflow) {
        width *= DateTime.fromSQL(program.end_at).setZone(config.TIMEZONE).diff(startDay)
          .as('minutes');
      } else {
        width *= program.duration;
      }

      const left = program.start_overflow ? 0 : (DateTime.fromSQL(program.start_at)
        .setZone(config.TIMEZONE).diff(startDay).as('minutes') * config.MINUTE_PIXEL);

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

/* ---------- COLLECTIONS ---------- */

// sort by share/name/etc, desc
const rankCollection = (collection, radios, categoriesExcluded) => {
  if (radios.length === 0) {
    return [];
  }

  const { sort_field: sortField, sort_order: sortOrder } = collection;

  return compose(
    filter(entry => collection.radios.indexOf(entry.code_name) !== -1),
    filter(entry => categoriesExcluded.indexOf(entry.category) === -1),
    orderBy([sortField], [sortOrder])
  )(radios);
};

const getCollectionIndex = (name, collections) => findIndex(collections, c => c.code_name === name);

const getNextCollection = (current, collections, radios, way) => {
  const collectionsOrdered = sortBy(collections, 'priority');
  const indexOfCurrentCollection = getCollectionIndex(current, collectionsOrdered);

  let newIndex = 0;
  if (way === 'backward') {
    newIndex = indexOfCurrentCollection === 0 ? collectionsOrdered.length - 1
      : indexOfCurrentCollection - 1;
  } else if (way === 'forward') {
    newIndex = collectionsOrdered.length === (indexOfCurrentCollection + 1) ? 0
      : indexOfCurrentCollection + 1;
  }

  // has the collection any radios? If no, skip it.
  const nextCollection = collectionsOrdered[newIndex];

  if (nextCollection.radios.length === 0) {
    return getNextCollection(nextCollection.code_name, collections, radios, way);
  }

  return collectionsOrdered[newIndex].code_name;
};

export default {
  enforceScrollIndex,
  initialScrollIndexFunction,
  getUpdatedProgramText,
  getScheduleDisplay,
  rankCollection,
  getCollectionIndex,
  getNextCollection
};
