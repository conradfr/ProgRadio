import { defineStore } from 'pinia';
import { nextTick, markRaw } from 'vue';
import find from 'lodash/find';

import type { Countries } from '@/types/countries';
import type { Stream } from '@/types/stream';
import type { GetStreamsResponse } from '@/types/streams_api';

/* eslint-disable import/no-cycle */
import { useGlobalStore } from '@/stores/globalStore';
import { usePlayerStore } from '@/stores/playerStore';

import * as config from '../config/config';
import i18n from '../lang/i18n';
import cookies from '../utils/cookies';
// import cache from '../utils/cache';
import StreamsApi from '../api/StreamsApi';
import AndroidApi from '../api/AndroidApi';

type countryObject = {
  code: string,
  label: string
};

interface CountriesOption {
  code: string
  label: string
  disabled?: boolean
}

interface State {
  countries: Countries
  favorites: Array<string>
  selectedCountry: string
  streamRadios: Array<Stream>
  soloExtended: string|null
  selectedSortBy: string
  radioBrowserApi: string
  searchActive: boolean
  searchText: string|null
  searchLastTimestamp: number
  total: number
  page: number
}

/* eslint-disable import/prefer-default-export */
export const useStreamsStore = defineStore('streams', {
  state: (): State => ({
    countries: {},
    favorites: [],
    /* eslint-disable no-undef */
    // @ts-expect-error defaultCountry is defined on the global scope
    selectedCountry: cookies.get(config.COOKIE_STREAM_COUNTRY, defaultCountry),
    streamRadios: [],
    soloExtended: null,
    selectedSortBy: cookies.get(config.COOKIE_STREAM_SORT, config.STREAMING_DEFAULT_SORT),
    radioBrowserApi: cookies.get(config.COOKIE_STREAM_RADIOBROWSER_API),
    searchActive: false,
    searchText: null,
    searchLastTimestamp: 0,
    total: 0,
    page: 1
  }),
  getters: {
    countriesOptions: (state): CountriesOption[] => {
      const countriesOptions: CountriesOption[] = [];
      countriesOptions.push(
        {
          label: i18n.global.tc('message.streaming.categories.all_countries'),
          code: config.STREAMING_CATEGORY_ALL
        }
      );

      for (const [key, value] of Object.entries(state.countries)) {
        if (i18n.global.locale === 'fr' && ['FR', 'BE', 'CH', 'LU', 'MC'].indexOf(key) !== -1) {
          countriesOptions.unshift(
            {
              label: value,
              code: key
            }
          );
        } else if (i18n.global.locale === 'es'
          && ['MX', 'ES', 'CO', 'AR', 'PE', 'CL'].indexOf(key) !== -1) {
          countriesOptions.unshift(
            {
              label: value,
              code: key
            }
          );
        } else if (i18n.global.locale === 'en'
          && ['US', 'GB', 'CA', 'AU', 'NZ'].indexOf(key) !== -1) {
          countriesOptions.unshift(
            {
              label: value,
              code: key
            }
          );
        } else if (i18n.global.locale === 'de' && ['DE', 'AT', 'CH'].indexOf(key) !== -1) {
          countriesOptions.unshift(
            {
              label: value,
              code: key
            }
          );
        } else if (i18n.global.locale === 'pt' && ['PT', 'BR'].indexOf(key) !== -1) {
          countriesOptions.unshift(
            {
              label: value,
              code: key
            }
          );
        } else if (i18n.global.locale === 'it'
          && ['IT', 'CH', 'SM', 'VA', 'MT', 'MC', 'SI'].indexOf(key) !== -1) {
          countriesOptions.unshift(
            {
              label: value,
              code: key
            }
          );
        } else if (i18n.global.locale === 'pl'
          && ['PL'].indexOf(key) !== -1) {
          countriesOptions.unshift(
            {
              label: value,
              code: key
            }
          );
        } else if (i18n.global.locale === 'el'
          && ['GR'].indexOf(key) !== -1) {
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
      }

      countriesOptions.unshift(
        {
          label: i18n.global.tc('message.streaming.categories.last'),
          code: config.STREAMING_CATEGORY_LAST
        }
      );

      countriesOptions.unshift(
        {
          label: i18n.global.tc('message.streaming.categories.favorites'),
          code: config.STREAMING_CATEGORY_FAVORITES,
          disabled: state.favorites.length === 0
        }
      );

      return countriesOptions;
    },
    /* eslint-disable max-len */
    getOneStream: state => (id: string): Stream|null => find(state.streamRadios, ['code_name', id]) || null,
    getCountryName: state => (key: string): string|null => state.countries[key] || null
  },
  actions: {
    async getConfig() {
      /* eslint-disable camelcase */
      const { radio_browser_url } = await StreamsApi.getConfig();
      cookies.set(config.COOKIE_STREAM_RADIOBROWSER_API, radio_browser_url);
      this.radioBrowserApi = radio_browser_url;
    },
    getCountries() {
      const globalStore = useGlobalStore();
      globalStore.setLoading(true);

      // use cache before network fetching
      /* if (cache.hasCache(config.CACHE_KEY_STREAM_COUNTRIES)) {
        commit('updateCountries', cache.getCache(config.CACHE_KEY_STREAM_COUNTRIES));
        dispatch('countrySelection', state.selectedCountry);
      }

      if (state.countries === []) {
        commit('setLoading', true, { root: true });
      } */

      nextTick(async () => {
        const countries = await StreamsApi.getCountries();
        if (countries !== null) {
          this.countries = markRaw(countries);
          if (this.selectedCountry === null) {
            this.countrySelection(this.selectedCountry);
          }
        }
        globalStore.setLoading(false);
      });
    },
    getStreamRadio(radioId: string) {
      const globalStore = useGlobalStore();
      globalStore.setLoading(true);

      nextTick(async () => {
        const data = await StreamsApi.getStreams(radioId);
        if (data !== null) {
          this.updateStreamRadios(data);
        }

        globalStore.setLoading(false);
      });
    },
    getStreamRadios() {
      const globalStore = useGlobalStore();
      globalStore.setLoading(true);

      const offset = (this.page - 1) * config.STREAMS_DEFAULT_PER_PAGE;

      if (this.searchActive && this.searchText !== null && this.searchText !== '') {
        nextTick(async () => {
          const data = await StreamsApi.searchStreams(
            this.searchText,
            this.selectedCountry,
            this.selectedSortBy,
            offset);

          if (data !== null && data.timestamp !== undefined
            && data?.timestamp > this.searchLastTimestamp) {
            this.searchLastTimestamp = data.timestamp;
            this.updateStreamRadios(data);
          }

          globalStore.setLoading(false);
        });
        return;
      }

      nextTick(async () => {
        const data = await StreamsApi.getStreams(this.selectedCountry, this.selectedSortBy, offset);
        if (data !== null) {
          this.updateStreamRadios(data);
        }

        globalStore.setLoading(false);
      });
    },
    updateStreamRadios(data: GetStreamsResponse) {
      this.streamRadios = markRaw(data.streams);
      this.total = data.total;
    },
    setSoloExtended(codeName: string|null) {
      if (codeName !== null) {
        const streamIsLoaded = this.getOneStream(codeName);

        if (streamIsLoaded === null) {
          this.getStreamRadio(codeName);
        }
      }

      this.soloExtended = codeName;
    },
    sendStreamsList() {
      AndroidApi.list(this.streamRadios);
    },
    setStreamFavorites(favorites: Array<string>) {
      if (this.favorites.length === 0) {
        this.favorites = favorites;
      }
    },
    /* eslint-disable no-param-reassign */
    countrySelection(country: countryObject|string) {
      // if country is just country_code
      if (typeof country === 'string') {
        country = <countryObject>find(this.countriesOptions, ['code', country.toUpperCase()])
          || { code: country, label: null };
      }

      // preserve page if no actual change
      if (this.selectedCountry !== country.code.toUpperCase()) {
        this.selectedCountry = country.code.toUpperCase();
        this.page = 1;
      }

      cookies.set(config.COOKIE_STREAM_COUNTRY, country.code.toUpperCase());

      nextTick(() => {
        this.getStreamRadios();
      });
    },
    pageSelection(page: number) {
      this.page = page;

      nextTick(() => {
        this.getStreamRadios();
      });
    },
    // TODO refactor page selection
    pageSet(page: number) {
      this.page = page;
    },
    sortBySelection(sortBy: string) {
      this.soloExtended = null;
      // preserve page if no actual change
      if (this.selectedSortBy !== sortBy) {
        this.selectedSortBy = sortBy;
        this.page = 1;
      }
      cookies.set(config.COOKIE_STREAM_SORT, sortBy);

      nextTick(() => {
        this.getStreamRadios();
      });
    },
    playRandom() {
      const globalStore = useGlobalStore();
      const playerStore = usePlayerStore();
      globalStore.setLoading(true);

      nextTick(async () => {
        const stream = await StreamsApi.getRandom(this.selectedCountry);
        if (stream !== null) {
          playerStore.playStream(stream);
        }

        globalStore.setLoading(false);
      });
    },
    setSearchActive(status: boolean) {
      this.searchActive = status;

      if (!status) {
        const oldText = this.searchText;
        this.searchText = null;

        if (oldText !== null && oldText !== '') {
          nextTick(async () => {
            this.getStreamRadios();
          });
        }
      }
    },
    setSearchText(text: string|null): boolean {
      if (this.searchText === text) {
        return false;
      }

      if (text !== null && text.trim() !== '') {
        this.soloExtended = null;
      }

      this.searchText = text;

      /* eslint-disable no-underscore-dangle */
      if ((this as any).$router.currentRoute._rawValue.params.page !== undefined
        && (this as any).$router.currentRoute._rawValue.params.page !== null
        && (this as any).$router.currentRoute._rawValue.params.page !== ''
        && (this as any).$router.currentRoute._rawValue.params.page !== '1') {
        const params = { ...(this as any).$router.currentRoute._rawValue.params, page: '1' };
        (this as any).$router.push({ name: 'streaming', params, replace: true });
        return false;
      }

      this.pageSet(1);
      return true;
    }
  }
});
