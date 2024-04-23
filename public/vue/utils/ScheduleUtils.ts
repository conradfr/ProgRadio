import { toRaw } from 'vue';
import { useWebWorkerFn } from '@vueuse/core';
import sortBy from 'lodash/sortBy';
import findIndex from 'lodash/findIndex';
import find from 'lodash/find';

import compose from 'lodash/fp/compose';
import filter from 'lodash/fp/filter';
import orderBy from 'lodash/fp/orderBy';

import { DateTime } from 'luxon';

import type { Schedule } from '@/types/schedule';
import type { Collection } from '@/types/collection';
import type { Radio } from '@/types/radio';
import type { SubRadio } from '@/types/sub_radio';
import type { Stream } from '@/types/stream';
import type { ScheduleDisplay } from '@/types/schedule_display';
import type { Program } from '@/types/program';

import * as config from '../config/config';

/* ---------- GRID---------- */

const enforceScrollIndex = (rawScrollIndex: number) => {
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

const initialScrollIndexFunction = (currentDateTime: DateTime) => {
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

const updatedProgramTextCalc = (
  schedule: Schedule,
  scheduleDisplay: Record<string, ScheduleDisplay>,
  scrollIndex: number
) => {
  const update: { [key: string]: number } = {};

  /* eslint-disable @typescript-eslint/no-unused-vars */
  for (const [_key, subRadios] of Object.entries(schedule)) {
    for (const [_key2, programs] of Object.entries(subRadios)) {
      if (programs) {
        for (const key of Object.keys(programs)) {
          let left = 0;

          if (scheduleDisplay[key].container.left < scrollIndex
            && (scheduleDisplay[key].container.left + scheduleDisplay[key].container.width)
            > scrollIndex) {
            left = scrollIndex - scheduleDisplay[key].container.left;
          }

          if (left !== scheduleDisplay[key].textLeft) {
            update[key] = left;
          }
        }
      }
    }
  }

  return update;
};

const getUpdatedProgramText = (
  schedule: Schedule,
  scheduleDisplay: Record<string, ScheduleDisplay>,
  scrollIndex: number
) => {
  const { workerFn } = useWebWorkerFn(updatedProgramTextCalc);
  return workerFn(schedule, toRaw(scheduleDisplay), scrollIndex);
};

/* eslint-disable no-undef */
/* eslint-disable max-len */
const getScheduleDisplay = (schedule: Schedule, currentTime: DateTime, initialScrollIndex: number) => {
  const startDay = currentTime.startOf('day');
  /* we use midnight next day as "end of current day",
     as shows usually ends a midnight next day and not 23:59:59 */
  const endDay = currentTime.plus({ days: 1 }).startOf('day');
  const result: { [key: string]: ScheduleDisplay } = {};

  /* eslint-disable @typescript-eslint/no-unused-vars */
  for (const [_key, subRadios] of Object.entries(schedule)) {
    for (const [_key2, programs] of Object.entries(subRadios)) {
      if (programs) {
        for (const [key, programRaw] of Object.entries(programs)) {
          let width = config.MINUTE_PIXEL;
          const program: Program = programRaw;

          // @todo I guess we'll look at shows that start prev day and ends next day later ...
          if (program.end_overflow) {
            width *= endDay.diff(DateTime.fromISO(program.start_at).setZone(config.TIMEZONE))
              .as('minutes');
          } else if (program.start_overflow) {
            width *= DateTime.fromISO(program.end_at).setZone(config.TIMEZONE).diff(startDay)
              .as('minutes');
          } else {
            width *= program.duration;
          }

          const left = program.start_overflow ? 0 : (DateTime.fromISO(program.start_at)
            .setZone(config.TIMEZONE).diff(startDay).as('minutes') * config.MINUTE_PIXEL);

          result[key] = {
            container: {
              left,
              width,
            },
            textLeft: 0
          };
        }
      }
    }
  }

  const updatedProgramText = updatedProgramTextCalc(schedule, result, initialScrollIndex);

  for (const [key, value] of Object.entries(updatedProgramText)) {
    result[key].textLeft = value;
  }

  return result;
};

/* ---------- COLLECTIONS ---------- */

// sort by share/name/etc, desc
const rankCollection = (
  collectionCodeName : string,
  collections: Record<string, Collection>,
  radios: Record<string, Radio>,
  categoriesExcluded: string[],
  preRollExcluded: boolean
): Radio[] => {
  if (Object.keys(radios).length === 0) {
    return [];
  }

  // special case, we loop each collection to get all radios
  if (collectionCodeName === config.COLLECTION_ALL) {
    const collectionNotExcluded = (entry: Collection) => config.COLLECTION_EXCLUDED_FROM_ALL.indexOf(entry.code_name) === -1;
    const collectionsOrdered = compose(
      filter(collectionNotExcluded),
      orderBy(['priority'], ['asc'])
    )(collections);

    return collectionsOrdered.reduce((acc: Radio[], entry: Collection) => {
      const radiosOfCollection = rankCollection(entry.code_name, collections, radios, categoriesExcluded, preRollExcluded);
      return [...acc, ...radiosOfCollection];
    }, []);
  }

  const collection = <Collection>find(collections,
    { code_name: collectionCodeName });

  const { sort_field: sortField, sort_order: sortOrder } = collection;

  const collectionHasRadio = (entry: Radio) => collection.radios.indexOf(entry.code_name) !== -1;
  const isCategoryExcluded = (entry: Radio) => categoriesExcluded.indexOf(entry.category) === -1;
  const isPreRollExcluded = (entry: Radio) => !(preRollExcluded && entry.has_preroll);

  return compose(
    filter(collectionHasRadio),
    filter(isCategoryExcluded),
    filter(isPreRollExcluded),
    orderBy([sortField], [sortOrder])
  )(radios);
};

/* eslint-disable max-len */
/* eslint-disable arrow-parens */
const getCollectionIndex = (codeName: string, collections: Collection[]) => findIndex(collections, (c) => c.code_name === codeName);

/* eslint-disable max-len */
const getNextCollection = (currentCodeName: string, collections: Record<string, Collection>, radios: Record<string, Radio>, way: 'backward'|'forward'): string => {
  const collectionsOrdered = sortBy(collections, 'priority');
  const indexOfCurrentCollection = getCollectionIndex(currentCodeName, collectionsOrdered);

  let newIndex = 0;
  if (way === 'backward') {
    newIndex = indexOfCurrentCollection === 0 || currentCodeName === config.COLLECTION_ALL
      ? collectionsOrdered.length - 1 : indexOfCurrentCollection - 1;
  } else if (way === 'forward') {
    newIndex = collectionsOrdered.length === (indexOfCurrentCollection + 1) || currentCodeName === config.COLLECTION_ALL
      ? 0 : indexOfCurrentCollection + 1;
  }

  // has the collection any radios? If no, skip it.
  const nextCollection = collectionsOrdered[newIndex];

  if (nextCollection.radios.length === 0) {
    return getNextCollection(nextCollection.code_name, collections, radios, way);
  }

  return collectionsOrdered[newIndex].code_name;
};

const getStreamFromCodeName = (streamCodeName: string|null, radio: Radio|Stream) => {
  if (streamCodeName === null) {
    return null;
  }

  if (Object.prototype.hasOwnProperty.call(radio, 'streams')
    // @ts-ignore
    && Object.prototype.hasOwnProperty.call(radio.streams, streamCodeName)) {
    // @ts-ignore
    return radio.streams[streamCodeName];
  }

  return null;
};

/* eslint-disable arrow-body-style */
const getMainSubRadio = (radioCodeName: string, radios: Record<string, Radio>): SubRadio => {
  // @ts-ignore
  return find(radios[radioCodeName].sub_radios, (v, _k) => {
    return v.main === true;
  });
};

export default {
  enforceScrollIndex,
  initialScrollIndexFunction,
  getUpdatedProgramText,
  getScheduleDisplay,
  rankCollection,
  getCollectionIndex,
  getNextCollection,
  getStreamFromCodeName,
  getMainSubRadio
};
