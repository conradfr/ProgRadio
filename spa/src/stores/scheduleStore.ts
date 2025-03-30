import { defineStore } from 'pinia';
import { nextTick, shallowReactive, markRaw } from 'vue';
import { DateTime, Interval } from 'luxon';
import sortBy from 'lodash/sortBy';
import find from 'lodash/find';
import without from 'lodash/without';
// @ts-ignore
import hash from 'object-hash';

import type { Category } from '@/types/category';
import type { Collection } from '@/types/collection';
import type { Radio } from '@/types/radio';
import type { SubRadio } from '@/types/sub_radio';
import type { Schedule } from '@/types/schedule';
import type { ScheduleDisplay } from '@/types/schedule_display';
import type { Program } from '@/types/program';

import { useGlobalStore } from '@/stores/globalStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useUserStore } from '@/stores/userStore';

import PlayerStatus from '@/types/player_status';

import typeUtils from '@/utils/typeUtils';
import * as config from '@/config/config';
import cache from '@/utils/cache';
import cookies from '@/utils/cookies';

// import router from '../router/router';
import ScheduleApi from '@/api/ScheduleApi';
import ScheduleUtils from '@/utils/ScheduleUtils';
import AndroidApi from '@/api/AndroidApi';

interface CategoryFilterFocus {
  icon: boolean
  list: boolean
}

interface State {
  radios: Record<string, Radio>
  categories: Category[]
  collections: Record<string, Collection>
  schedule: Schedule
  scheduleDisplay: Record<string, ScheduleDisplay>
  cursorTime: DateTime
  scrollIndex: number
  scrollClick: boolean
  swipeClick: boolean
  currentCollection: any
  preRollExcluded: boolean,
  categoriesExcluded: string[]
  categoryFilterFocus: CategoryFilterFocus,
  displayProgramModal: boolean,
  programModal: any|null,
  programForModal: Program|null
  displayRegionModal: boolean,
  regionModal: any|null,
  radioForRegionModal: Radio|null
}

const cursorTime: DateTime = DateTime.local().setZone(config.TIMEZONE);

const initialScrollIndex: number = ScheduleUtils.initialScrollIndexFunction(cursorTime);

export const useScheduleStore = defineStore('schedule', {
  state: (): State => ({
    radios: {},
    categories: [],
    collections: {},
    schedule: {},
    scheduleDisplay: {},
    cursorTime,
    scrollIndex: initialScrollIndex,
    scrollClick: false,
    swipeClick: false,
    currentCollection: cookies.get(config.COOKIE_COLLECTION, config.DEFAULT_COLLECTION),
    preRollExcluded: cookies.get(config.COOKIE_PREROLL_EXCLUDED, 'false') === 'true',
    categoriesExcluded: cookies.has(config.COOKIE_EXCLUDE)
      ? cookies.get(config.COOKIE_EXCLUDE).split('|') : [],
    categoryFilterFocus: {
      icon: false,
      list: false
    },
    displayProgramModal: false,
    programModal: null,
    programForModal: null,
    displayRegionModal: false,
    regionModal: null,
    radioForRegionModal: null
  }),
  getters: {
    hasSchedule: state => state.schedule !== undefined && Object.keys(state.schedule).length > 0,
    cursorIndex: (state): string => {
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
    gridIndexLeft(state): { left: string } {
      return { left: `-${state.scrollIndex}px` };
    },
    gridIndexTransform: state => ({ transform: `translateX(-${state.scrollIndex}px)` }),
    rankedCollections: state => sortBy(state.collections, 'priority'),
    rankedRadios: (state) => {
      if (state.collections === undefined || state.collections === null
        || Object.keys(state.collections).length === 0
        || (state.currentCollection !== config.COLLECTION_ALL
          && state.collections[state.currentCollection] === undefined)) {
        return [];
      }

      return ScheduleUtils.rankCollection(
        state.currentCollection,
        state.collections,
        state.radios,
        state.categoriesExcluded,
        state.preRollExcluded
      );
    },
    isFavorite: state => (radioCodeName: string) => state.collections[config.COLLECTION_FAVORITES] !== undefined
      && state.collections[config.COLLECTION_FAVORITES].radios.indexOf(radioCodeName) !== -1,
    /* eslint-disable arrow-parens */
    displayCategoryFilter: state => state.categoryFilterFocus.icon
      || state.categoryFilterFocus.list || false,
    currentShowOnRadio(state: any) {
      return (radioCodeName: string) => {
        const subRadio = this.getSubRadio(radioCodeName);
        let currentShow = null;

        if (state.schedule[radioCodeName] && state.schedule[radioCodeName][subRadio.code_name]) {
          currentShow = find(state.schedule[radioCodeName][subRadio.code_name], (show) => Interval
            .fromDateTimes(DateTime.fromISO(show.start_at).setZone(config.TIMEZONE),
              DateTime.fromISO(show.end_at).setZone(config.TIMEZONE)).contains(state.cursorTime));
        }

        return typeof currentShow === 'undefined' || currentShow === null ? null : currentShow;
      };
    },
    isWebRadio: state => (radioCodeName: string, radioStreamCodeName: string): boolean => {
      if (state.radios[radioCodeName] === undefined
        || state.radios[radioCodeName].streams[radioStreamCodeName] === undefined) {
        return false;
      }

      return !state.radios[radioCodeName].streams[radioStreamCodeName].sub_radio;
    },
    getSubRadio: state => (radioCodeName: string) : SubRadio => {
      const userStore = useUserStore();
      const userSubRadioCodeName = userStore.getSubRadioCodeName(radioCodeName);

      if (userSubRadioCodeName !== null) {
        return state.radios[radioCodeName].sub_radios[userSubRadioCodeName];
      }

      return ScheduleUtils.getMainSubRadio(radioCodeName, state.radios);
    }
  },
  actions: {
    // ---------- SCROLL ----------

    scrollToCursor() {
      this.scrollIndex = ScheduleUtils.initialScrollIndexFunction(this.cursorTime);
      this.updateDisplayData();
    },
    scroll(x: number) {
      this.scrollTo(x);
      this.updateDisplayData();
    },
    scrollBackward() {
      this.scrollTo(-1 * config.NAV_MOVE_BY);
      this.updateDisplayData();
    },
    scrollForward() {
      this.scrollTo(config.NAV_MOVE_BY);
      this.updateDisplayData();
    },
    setScrollClick(value: boolean) {
      this.scrollClick = value;
      this.updateDisplayData();
    },
    setSwipeClick(value: boolean) {
      this.swipeClick = value;
    },
    scrollTo(x: number) {
      this.scrollIndex = ScheduleUtils.enforceScrollIndex(this.scrollIndex + x);
    },
    async updateDisplayData() {
      if (this.scrollClick) {
        return;
      }

      const update = await ScheduleUtils.getUpdatedProgramText(
        this.schedule,
        this.scheduleDisplay,
        this.scrollIndex);

      for (const [key, data] of Object.entries(update)) {
        this.scheduleDisplay[key].textLeft = data;
      }
    },

    // ---------- COLLECTIONS ----------

    collectionBackward() {
      const nextCollection = ScheduleUtils.getNextCollection(
        this.currentCollection,
        this.collections,
        this.radios,
        'backward'
      );

      this.$router.push({ name: 'schedule', params: { collection: nextCollection } });
    },
    collectionForward() {
      const nextCollection = ScheduleUtils.getNextCollection(
        this.currentCollection,
        this.collections,
        this.radios,
        'forward'
      );

      this.$router.push({ name: 'schedule', params: { collection: nextCollection } });
    },
    switchCollection(collection: string) {
      this.currentCollection = collection;

      setTimeout(() => {
        cookies.set(config.COOKIE_COLLECTION, collection);
      }, 300);
    },
    setFavoritesCollection(radios: Array<string>) {
      if (this.collections === undefined
        || this.collections[config.COLLECTION_FAVORITES] === undefined) {
        return;
      }

      this.collections[config.COLLECTION_FAVORITES].radios = radios || [];
    },
    sendRadiosList() {
      if (this.collections === null || Object.keys(this.collections).length === 0
        || this.currentCollection === null) {
        return;
      }

      const radios = ScheduleUtils.rankCollection(
        this.currentCollection,
        this.collections,
        this.radios,
        this.categoriesExcluded,
        this.preRollExcluded);

      AndroidApi.list(radios);
    },

    // ---------- CATEGORY ----------

    setCategoryFilterFocus(element: 'list'|'icon', status: boolean) {
      this.categoryFilterFocus[element] = status;
    },
    toggleExcludeCategory(category: string) {
      if (this.categoriesExcluded.indexOf(category) === -1) {
        this.categoriesExcluded.push(category);
      } else {
        this.categoriesExcluded = without(this.categoriesExcluded, category);
      }

      setTimeout(() => {
        cookies.set(config.COOKIE_EXCLUDE, this.categoriesExcluded.join('|'));
      }, 500);
    },
    preRollExcludedToggle() {
      cookies.set(config.COOKIE_PREROLL_EXCLUDED, !this.preRollExcluded);
      this.preRollExcluded = !this.preRollExcluded;
    },

    // ---------- CALENDAR ----------

    setCalendarToday() {
      const newDate = DateTime.local().setZone(config.TIMEZONE);
      this.updateCursor(newDate);

      nextTick(() => {
        this.getSchedule();
      });
    },
    setCalendarBackward() {
      const newDate = this.cursorTime.minus({ days: 1 });
      this.updateCursor(newDate);

      nextTick(() => {
        this.getSchedule();
      });
    },
    setCalendarForward() {
      const newDate = this.cursorTime.plus({ days: 1 });
      this.updateCursor(newDate);

      nextTick(() => {
        this.getSchedule();
      });
    },
    tick() {
      const player = usePlayerStore();
      const now = DateTime.local().setZone(config.TIMEZONE);

      if (now.hour === 0 && now.minute < 2) {
        this.getSchedule();
      }

      if (player.playing === PlayerStatus.Playing && player.radio !== null
        && typeUtils.isRadio(player.radio)) {
        player.updateShow();
      }

      this.updateCursor(now);
    },
    updateCursor(value: DateTime) {
      this.cursorTime = value;
    },

    // ---------- DATA & SCHEDULE ----------

    getRadiosData() {
      const globalStore = useGlobalStore();
      const userStore = useUserStore();

      // use cache before network fetching
      if (cache.hasCache(config.CACHE_KEY_RADIOS)) {
        this.radios = cache.getCache(config.CACHE_KEY_RADIOS);
      }

      if (cache.hasCache(config.CACHE_KEY_CATEGORIES)) {
        this.categories = cache.getCache(config.CACHE_KEY_CATEGORIES);
      }

      if (cache.hasCache(config.CACHE_KEY_CATEGORIES)) {
        this.updateCollections(cache.getCache(config.CACHE_KEY_COLLECTIONS));
      }

      globalStore.setLoading(true);

      setTimeout(
        async () => {
          const radiosData = await ScheduleApi.getRadiosData();

          if (radiosData !== null) {
            if (radiosData.radios !== undefined) {
              this.radios = shallowReactive(radiosData.radios);
            }

            if (radiosData.collections !== undefined) {
              this.updateCollections(radiosData.collections);
            }

            if (radiosData.categories !== undefined) {
              this.categories = shallowReactive(radiosData.categories);
            }

            userStore.syncRadioFavorites();
          }

          globalStore.setLoading(false);
        },
        50
      );
    },
    getSchedule(params: any = {}) {
      const globalStore = useGlobalStore();
      const dateStr: string = this.cursorTime.toISODate();
      // TODO better manage collections vs full day cache
      const cacheHash = `${dateStr}_${hash(params)}`;

      // if we have cache we display it immediately and then fetch an update silently
      if (cache.hasSessionCache(cacheHash)) {
        this.updateSchedule(cache.getSessionCache(cacheHash));
      } else {
        globalStore.setLoading(true);
      }

      if (params !== undefined && params !== null && params !== '') {
        // api don't have user favorites access
        /* eslint-disable no-param-reassign */
        if (params.collection !== undefined
          && (params.collection === config.COLLECTION_FAVORITES || (params.collection === config.COLLECTION_ALL))) {
          if (params.collection === config.COLLECTION_FAVORITES) {
            if (this.collections[config.COLLECTION_FAVORITES] !== undefined) {
              params.radios = this.collections[config.COLLECTION_FAVORITES].radios;
            }
          }
          delete params.collection;
        }

        setTimeout(
          async () => {
            // params.now = true;
            const scheduleData = await ScheduleApi.getSchedule(dateStr, params);
            if (scheduleData !== null) {
              this.updateSchedule(scheduleData);
            }

            globalStore.setLoading(false);

            /* params.now = false;
            scheduleData = await ScheduleApi.getSchedule(dateStr, params);
            if (scheduleData !== null) {
              this.updateSchedule(scheduleData);
            } */
          },
          75
        );
      } else {
        if (cache.hasSessionCache(cacheHash)) {
          this.updateSchedule(cache.getSessionCache(cacheHash));
        }

        setTimeout(
          async () => {
            // let scheduleData = await ScheduleApi.getSchedule(dateStr, { now: true });
            const scheduleData = await ScheduleApi.getSchedule(dateStr);
            if (scheduleData !== null) {
              this.updateSchedule(scheduleData);
            }
            globalStore.setLoading(false);

            /* scheduleData = await ScheduleApi.getSchedule(dateStr);
            if (scheduleData !== null) {
              this.updateSchedule(scheduleData);
            } */
          },
          75
        );
      }
    },
    updateSchedule(schedule: Schedule) {
      // remove null schedules
      const filteredSchedule = Object.entries(schedule).reduce((acc: Schedule, [key, value]) => {
        if (value !== null) {
          acc[key] = value;
        }
        return acc;
      }, {});

      const updatedSchedule: any = { ...{ ...this.schedule }, ...filteredSchedule };
      const scheduleDisplay = ScheduleUtils.getScheduleDisplay(
        updatedSchedule, this.cursorTime, initialScrollIndex
      );

      this.schedule = markRaw(updatedSchedule);
      this.scheduleDisplay = scheduleDisplay;
    },
    updateCollections(collections: Record<string, Collection>) {
      const favoritesCollectionRadios = this.collections.favorites !== undefined
        ? this.collections.favorites.radios : [];

      for (const [key, data] of Object.entries(collections)) {
        if (key === config.COLLECTION_FAVORITES) {
          collections[config.COLLECTION_FAVORITES].radios = favoritesCollectionRadios;
        } else {
          collections[key] = shallowReactive(data);
        }
      }

      this.collections = collections;
    },
    // done globally here as Bootstrap modal is better at the html root due to fixed positioning
    activateProgramModal(program: Program) {
      this.displayProgramModal = true;
      this.programForModal = program;

      nextTick(() => {
        const modalElem = document.getElementById('scheduleRadioProgramModal');

        modalElem?.addEventListener('hidden.bs.modal', () => {
          this.displayProgramModal = false;
          this.programModal = null;
          this.programForModal = null;
        });

        // @ts-expect-error bootstrap is defined on global scope
        // eslint-disable-next-line no-undef
        this.programModal = new bootstrap.Modal(modalElem);
        this.programModal?.show();
      });
    },
    activateRegionModal(radio: Radio) {
      this.displayRegionModal = true;
      this.radioForRegionModal = radio;

      nextTick(() => {
        const modalElem = document.getElementById('scheduleRadioRegionModal');

        modalElem?.addEventListener('hidden.bs.modal', () => {
          this.displayRegionModal = false;
          this.regionModal = null;
          this.radioForRegionModal = null;
        });

        // @ts-expect-error bootstrap is defined on global scope
        // eslint-disable-next-line no-undef
        this.regionModal = new bootstrap.Modal(modalElem);
        this.regionModal?.show();
      });
    }
  }
});
