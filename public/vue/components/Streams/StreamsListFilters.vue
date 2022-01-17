<template>
  <div class="streams-filters-container mt-3 mb-0 d-flex flex-row flex-wrap">
      <div class="mb-3 me-auto">
        <div class="input-group" v-if="searchActive">
          <span class="input-group-text" id="search-addon1">
            <i class="bi bi-search"></i>
          </span>
          <input type="text"
            class="form-control"
            style="min-width: 275px"
            :placeholder="$t('message.streaming.search_placeholder')"
            name="searchText"
            ref="searchText"
            aria-describedby="search-addon1"
            :value="searchText"
            v-on:input="searchTextChange"
            v-on:blur="searchDeactivate"
          />
          <i class="bi bi-x-lg form-control-feedback"
             v-on:click="searchDeactivate(true)"></i>
        </div>

        <button v-if="!searchActive" class="btn btn-primary btn-sm me-1" type="submit"
                v-on:click="searchActivate">
          <i class="bi bi-search"></i>
        </button>
        <button v-if="!searchActive" class="btn btn-primary btn-sm" type="submit"
          v-on:click="playRandom">
          <i class="bi bi-play-circle"></i>
          {{ $t('message.streaming.random') }}
        </button>
      </div>
      <div class="me-1 mb-3">
        <button type="submit"
          class="btn btn-primary btn-sm me-1"
          v-on:click="geoloc">
          <i class="bi bi-geo-alt"></i>
        </button>
      </div>
      <div class="d-flex d-row flex-wrap">
        <div class="pe-3 mb-3 me-1 multiselect-div" style="min-width: 300px;">
          <Multiselect
              @change="countryChange"
              :model-value="selectedCountry"
              :options="countriesOptions"
              :canClear="false"
              :valueProp="'code'"
              :label="'label'"
              :searchable="true"
              :strict="false"
              :noResultsText="$tc('message.streaming.country_search_no_result')"
              ref="multicountry"
              id="multicountry"
          >
            <template v-slot:singlelabel="{ value }">
              <div class="multiselect-single-label">
                <img v-if="value.code === code_all || value.code === code_favorites"
                     class="gb-flag gb-flag--mini"
                     :src="'/img/' + value.code.toLowerCase() + '_streams.svg'">
                <gb-flag
                    v-else
                    :code="value.code"
                    size="mini"
                />&nbsp;&nbsp;{{ value.label }}
              </div>
            </template>

            <template v-slot:option="{ option }">
              <img v-if="option.code === code_all || option.code === code_favorites"
                   class="gb-flag gb-flag--mini"
                   :src="'/img/' + option.code.toLowerCase() + '_streams.svg'">
              <gb-flag
                  v-else
                  :code="option.code"
                  size="mini"
              />&nbsp;&nbsp;{{ option.label }}
            </template>
          </Multiselect>
        </div>
        <div class="pe-3 mb-3 multiselect-div" style="min-width: 250px">
          <Multiselect
              @change="sortByChange"
              :model-value="selectedSortBy"
              :options="sortByOptions"
              :canClear="false"
              ref="multisort"
              id="multisort"
          />
        </div>
      </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { nextTick } from 'vue';
import Multiselect from '@vueform/multiselect';
import StreamsApi from '../../api/StreamsApi';

import {
  STREAMING_CATEGORY_FAVORITES,
  STREAMING_CATEGORY_ALL,
  GTAG_CATEGORY_STREAMING,
  GTAG_STREAMING_ACTION_FILTER_COUNTRY,
  GTAG_STREAMING_ACTION_FILTER_SORT,
  GTAG_STREAMING_ACTION_GEOLOC,
  GTAG_ACTION_PLAY_RANDOM,
  GTAG_STREAMING_FILTER_VALUE,
  GTAG_ACTION_PLAY_VALUE,
  GTAG_ACTION_SEARCH_BUTTON
} from '../../config/config';

export default {
  compatConfig: {
    MODE: 3
  },
  components: {
    Multiselect,
  },
  mounted() {
    if (this.$route.query.s !== undefined) {
      this.searchActivate();
      this.searchTextChange({ target: { value: this.$route.query.s } });
    }
  },
  data() {
    return {
      code_all: STREAMING_CATEGORY_ALL,
      code_favorites: STREAMING_CATEGORY_FAVORITES,
      sortByOptions: [
        {
          value: 'name',
          label: this.$i18n.t('message.streaming.sort.name')
        },
        {
          value: 'popularity',
          label: this.$i18n.t('message.streaming.sort.popularity')
        },
        {
          value: 'random',
          label: this.$i18n.t('message.streaming.sort.random')
        }
      ]
    };
  },
  computed: {
    ...mapGetters([
      'countriesOptions'
    ]),
    ...mapState({
      favorites: state => state.streams.favorites,
      searchText: state => state.streams.searchText,
      searchActive: state => state.streams.searchActive
    }),
    selectedCountry: {
      get() {
        return this.$store.state.streams.selectedCountry;
      }
    },
    selectedSortBy: {
      get() {
        return this.$store.state.streams.selectedSortBy;
      }
    }
  },
  methods: {
    searchActivate() {
      this.$store.dispatch('setSearchActive', true)
        .then(() => {
          nextTick(() => {
            this.$refs.searchText.focus();
          });
        });

      this.$gtag.event(GTAG_ACTION_SEARCH_BUTTON, {
        event_category: GTAG_CATEGORY_STREAMING,
        value: GTAG_STREAMING_FILTER_VALUE
      });
    },
    searchDeactivate(force) {
      if (force === true || this.searchText === null || this.searchText.trim() === '') {
        this.$store.dispatch('setSearchActive', false);
      }
    },
    searchTextChange(event) {
      this.$store.dispatch('setSearchText', event.target.value)
        .then(() => {
          nextTick(() => {
            this.$store.dispatch('getStreamRadios');
          });
        });
    },
    countryChange(country) {
      if (country === undefined || country === null) {
        return;
      }

      // otherwise it's just the setup
      if (country !== this.selectedCountry) {
        this.$gtag.event(GTAG_STREAMING_ACTION_FILTER_COUNTRY, {
          event_category: GTAG_CATEGORY_STREAMING,
          event_label: country.toLowerCase(),
          value: GTAG_STREAMING_FILTER_VALUE
        });

        this.$router.push({
          name: 'streaming',
          params: { countryOrCategoryOrUuid: country.toLowerCase() }
        });
      }
    },
    sortByChange(sortBy) {
      if (sortBy === undefined || sortBy === null) {
        return;
      }

      // otherwise it's just the setup
      if (sortBy !== this.selectedSortBy) {
        this.$gtag.event(GTAG_STREAMING_ACTION_FILTER_SORT, {
          event_category: GTAG_CATEGORY_STREAMING,
          event_label: sortBy.code,
          value: GTAG_STREAMING_FILTER_VALUE
        });

        this.$store.dispatch('sortBySelection', sortBy);
      }
    },
    playRandom() {
      this.$gtag.event(GTAG_ACTION_PLAY_RANDOM, {
        event_category: GTAG_CATEGORY_STREAMING,
        event_label: 'random',
        value: GTAG_ACTION_PLAY_VALUE
      });

      this.$store.dispatch('playRandom');
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
            if (geoData.countryCode !== undefined && geoData.countryCode !== null) {
              this.$router.push({
                name: 'streaming',
                params: { countryOrCategoryOrUuid: geoData.countryCode.toLowerCase() }
              });
            }
          });
        });
      }
    }
  }
};
</script>
