<template>
  <div class="streams-filters-container mt-3 mb-0 d-flex flex-row flex-wrap">
    <div class="mb-3 me-auto streams-filters-search d-flex">
      <div v-if="searchActive" style="display: inline-block" class="me-2">
        <div class="input-group">
          <span id="search-addon1" class="input-group-text">
            <i class="bi bi-search"></i>
          </span>
          <input
            :ref="addSearchTextRef"
            class="form-control"
            style="min-width: 275px"
            :placeholder="$t('message.streaming.search_placeholder')"
            :value="searchText"
            name="searchText"
            aria-describedby="search-addon1"
            type="text"
            @input="searchTextChange"
            @blur="searchDeactivate"
          />
          <i class="bi bi-x-lg form-control-feedback" @click="searchDeactivate(true)"></i>
        </div>
      </div>

      <button v-if="!searchActive" class="btn btn-primary btn-sm me-1" type="submit" @click="searchActivate">
        <i class="bi bi-search"></i>
      </button>
      <button v-if="!searchActive" v-once class="btn btn-primary btn-sm" type="submit" @click="playOneRandom">
        <i class="bi bi-play-circle"></i>
        {{ $t('message.streaming.random') }}
      </button>
    </div>
    <div class="me-1 mb-3">
      <button type="submit"
        :disabled="favorites.length === 0"
        class="btn btn-primary btn-sm me-1"
        @click="switchToFavorites">
        <i class="bi bi-heart-fill"></i>
      </button>
    </div>
      <div class="me-1 mb-3">
        <button v-once class="btn btn-primary btn-sm me-1" type="submit" @click="geoloc">
          <i class="bi bi-geo-alt-fill"></i>
        </button>
      </div>
      <div class="d-flex d-row flex-wrap">
        <div class="pe-3 mb-3 me-1 multiselect-div" style="min-width: 300px;">
          <Multiselect
            id="multicountry"
            :model-value="selectedCountryInput"
            :options="countriesOptions"
            :canClear="false"
            :valueProp="'code'"
            :label="'label'"
            :searchable="true"
            :strict="false"
            :noResultsText="$t('message.streaming.country_search_no_result')"
            @change="countryChange"
            @open="countryOpen">
            <template #singlelabel="{ value }">
              <div class="multiselect-single-label">
                <img v-if="value.code === code_all || value.code === code_favorites"
                 class="gb-flag gb-flag--mini"
                 style="height: 20px; width: 25px;"
                 :src="'/img/' + value.code.toLowerCase() + '_streams.svg'">
                <img v-else-if="value.code === code_last || value.code === code_history"
                  class="gb-flag gb-flag--mini"
                  style="height: 20px; width: 24px;"
                  :src="'/img/' + value.code.toLowerCase() + '_streams.png'">
                <vue-flag
                  v-else
                  :code="value.code"
                  size="mini"
                />&nbsp;&nbsp;{{ value.label }}
              </div>
            </template>

            <template #option="{ option }">
              <img v-if="option.code === code_all || option.code === code_favorites"
                class="gb-flag gb-flag--mini"
                style="height: 20px; width: 25px;"
                :src="'/img/' + option.code.toLowerCase() + '_streams.svg'">
              <img v-else-if="option.code === code_last || option.code === code_history"
                class="gb-flag gb-flag--mini"
                style="height: 20px; width: 24px;"
                :src="'/img/' + option.code.toLowerCase() + '_streams.png'">
              <vue-flag v-else-if="displayFlags"
                :code="option.code"
                size="mini"
              />&nbsp;&nbsp;{{ option.label }}
            </template>
          </Multiselect>
        </div>
        <div class="pe-3 mb-3 multiselect-div" style="min-width: 250px">
          <Multiselect
            id="multisort"
            :model-value="selectedSortByInput"
            :options="sortByOptions"
            :canClear="false"
            :disabled="selectedCountryInput === code_last || selectedCountryInput === code_history"
            @change="sortByChange"
          />
        </div>
      </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, nextTick } from 'vue';
import { mapState, mapActions } from 'pinia';
import Multiselect from '@vueform/multiselect';

import { useStreamsStore } from '@/stores/streamsStore';
import { useUserStore } from '@/stores/userStore';

import {
  STREAMING_SEARCH_DELAY_BEFORE_SEND,
  STREAMING_CATEGORY_FAVORITES,
  STREAMING_CATEGORY_ALL,
  STREAMING_CATEGORY_HISTORY,
  STREAMING_CATEGORY_LAST,
  GTAG_CATEGORY_STREAMING,
  GTAG_STREAMING_ACTION_SWITCH_TO_FAVORITES,
  GTAG_STREAMING_ACTION_FILTER_COUNTRY,
  GTAG_STREAMING_ACTION_FILTER_SORT,
  GTAG_STREAMING_ACTION_GEOLOC,
  GTAG_ACTION_PLAY_RANDOM,
  GTAG_STREAMING_FILTER_VALUE,
  GTAG_ACTION_PLAY_VALUE,
  GTAG_ACTION_SEARCH_BUTTON
} from '@/config/config';

import StreamsApi from '@/api/StreamsApi';

export default defineComponent({
  components: {
    Multiselect,
  },
  data(): {
    refs: any,
    displayFlags: boolean,
    searchTimeout: number|null,
    code_all: string,
    code_last: string,
    code_favorites: string,
    code_history: string
  } {
    return {
      refs: {},
      displayFlags: false,
      searchTimeout: null,
      code_all: STREAMING_CATEGORY_ALL,
      code_last: STREAMING_CATEGORY_LAST,
      code_favorites: STREAMING_CATEGORY_FAVORITES,
      code_history: STREAMING_CATEGORY_HISTORY
    };
  },
  mounted() {
    if (this.$route.query.s !== undefined && typeof this.$route.query.s === 'string') {
      this.searchActivate();
      this.searchTextChange(this.$route.query.s);
    }
  },
  computed: {
    ...mapState(useUserStore, { userLogged: 'logged' }),
    ...mapState(useStreamsStore, [
      'favorites',
      'countriesOptions',
      'searchText',
      'searchActive',
      'selectedCountry',
      'selectedSortBy'
    ]),
    sortByOptions(): Array<any> {
      const options = [
        {
          value: 'name',
          label: this.$i18n.t('message.streaming.sort.name')
        },
        {
          value: 'popularity',
          label: this.$i18n.t('message.streaming.sort.popularity')
        },
        {
          value: 'last',
          label: this.$i18n.t('message.streaming.sort.last')
        }
      ];

      if (this.userLogged) {
        options.push({
          value: 'user_last',
          label: this.$i18n.t('message.streaming.sort.user_last')
        });
      }

      options.push({
        value: 'random',
        label: this.$i18n.t('message.streaming.sort.random')
      });

      return options;
    },
    selectedCountryInput(): string {
      return this.selectedCountry;
    },
    selectedSortByInput(): string|null {
      if (this.selectedCountryInput === STREAMING_CATEGORY_LAST
        || this.selectedCountryInput === STREAMING_CATEGORY_HISTORY) {
        return null;
      }

      return this.selectedSortBy;
    },
  },
  methods: {
    ...mapActions(useStreamsStore, [
      'setSearchActive',
      'setSearchText',
      'sendSearchText',
      'getStreamRadios',
      'sortBySelection',
      'playRandom'
    ]),
    addSearchTextRef(el: HTMLElement) {
      // @ts-ignore
      this.refs.searchText = el;
    },
    searchActivate() {
      this.setSearchActive(true);
      nextTick(() => {
        // @ts-ignore
        if (this.refs.searchText !== undefined) {
          // @ts-ignore
          this.refs.searchText.focus();
        }
      });

      this.$gtag.event(GTAG_ACTION_SEARCH_BUTTON, {
        event_category: GTAG_CATEGORY_STREAMING,
        value: GTAG_STREAMING_FILTER_VALUE
      });
    },
    searchDeactivate(force: boolean) {
      if (force === true || this.searchText === null || this.searchText.trim() === '') {
        this.setSearchActive(false);
      }
    },
    searchTextChange(event: Event|string) {
      const value: string|null = typeof event === 'string'
        ? event : (event.target as HTMLTextAreaElement).value;

      if (this.setSearchText(value)) {
        if (this.searchTimeout) {
          clearTimeout(this.searchTimeout);
        }

        this.searchTimeout = setTimeout(
            () => {
              this.sendSearchText(value?.trim());
            },
            STREAMING_SEARCH_DELAY_BEFORE_SEND
        );

        nextTick(() => {
          this.getStreamRadios();
        });
      }
    },
    countryOpen(): void {
      // substitute for loading="lazy" that does not seem to work here
      this.displayFlags = true;
    },
    countryChange(country: string): void {
      if (!country) {
        return;
      }

      // otherwise it's just the setup
      if (country !== this.selectedCountryInput) {
        this.$gtag.event(GTAG_STREAMING_ACTION_FILTER_COUNTRY, {
          event_category: GTAG_CATEGORY_STREAMING,
          event_label: country.toLowerCase(),
          value: GTAG_STREAMING_FILTER_VALUE
        });

        this.$router.push({
          name: 'streaming',
          params: { countryOrCategoryOrUuid: country.toLowerCase(), page: '1' }
        });
      }
    },
    sortByChange(sortBy: string): void {
      if (sortBy === undefined || sortBy === null) {
        return;
      }

      // otherwise it's just the setup
      if (sortBy !== this.selectedSortByInput) {
        this.$gtag.event(GTAG_STREAMING_ACTION_FILTER_SORT, {
          event_category: GTAG_CATEGORY_STREAMING,
          event_label: sortBy,
          value: GTAG_STREAMING_FILTER_VALUE
        });

        this.sortBySelection(sortBy);
      }
    },
    playOneRandom() {
      this.$gtag.event(GTAG_ACTION_PLAY_RANDOM, {
        event_category: GTAG_CATEGORY_STREAMING,
        event_label: 'random',
        value: GTAG_ACTION_PLAY_VALUE
      });

      this.playRandom();
    },
    switchToFavorites() {
      this.$gtag.event(GTAG_STREAMING_ACTION_SWITCH_TO_FAVORITES, {
        event_category: GTAG_CATEGORY_STREAMING,
        event_label: STREAMING_CATEGORY_FAVORITES.toLowerCase(),
        value: GTAG_STREAMING_FILTER_VALUE
      });

      this.$router.push({
        name: 'streaming',
        params: { countryOrCategoryOrUuid: STREAMING_CATEGORY_FAVORITES.toLowerCase(), page: '1' }
      });
    },
    geoloc() {
      this.$gtag.event(GTAG_STREAMING_ACTION_GEOLOC, {
        event_category: GTAG_CATEGORY_STREAMING,
        event_label: null,
        value: GTAG_STREAMING_FILTER_VALUE
      });

      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
          StreamsApi.getCountryFromLatLong(
            position.coords.latitude,
            position.coords.longitude
          ).then((geoData) => {
            if (geoData !== null && geoData.countryCode !== undefined
              && geoData.countryCode !== null) {
              this.$router.push({
                name: 'streaming',
                params: { countryOrCategoryOrUuid: geoData.countryCode.toLowerCase(), page: '1' }
              });
            }
          });
        });
      }
    }
  }
});
</script>
