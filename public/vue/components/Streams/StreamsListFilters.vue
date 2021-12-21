<template>
  <div class="container streams-filters-container mb-4">
    <div class="row">
      <div class="col-md-4 col-sm-12 pb-3 pb-sm-3 pb-md-0">
        <div class="input-group" v-if="searchActive">
          <span class="input-group-text" id="search-addon1">
            <i class="bi bi-search"></i>
          </span>
          <input type="text"
                 class="form-control"
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
      <div class="col-select col-md-4 col-sm-6">
        <Multiselect
            @change="countryChange"
            v-model="selectedCountry"
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
      <div class="col-select col-md-3 col-sm-6 mt-2 mt-sm-0">
        <Multiselect
            @change="sortByChange"
            v-model="selectedSortBy"
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

import {
  STREAMING_CATEGORY_FAVORITES,
  STREAMING_CATEGORY_ALL,
  GTAG_CATEGORY_STREAMING,
  GTAG_STREAMING_ACTION_FILTER_COUNTRY,
  GTAG_STREAMING_ACTION_FILTER_SORT,
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
    // for some reasons the multiselect component don't get the initial value,
    // so we set them here instead
    // (selected country is set in the watcher below)
    if (this.selectedSortBy !== undefined && this.selectedSortBy !== null) {
      this.$refs.multisort.select(this.selectedSortBy);
    }

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
  watch: {
    // for some reasons the multiselect component don't get the initial value,
    // so we set them here instead, when the full list has been loaded
    countriesOptions(newValue, oldValue) {
      // 4 is an arbitrary value, the initial list is 2
      // but in case we add more in the future, let's get a bit of headroom ...
      if ((oldValue.length < 4 && newValue.length > 4)
          && (this.selectedCountry !== undefined && this.selectedCountry !== null)) {
        nextTick(() => {
          this.$refs.multicountry.select(this.selectedCountry);
        });
      }
    }
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
      },
      set(country) {
        if (country === undefined || country === null) {
          return;
        }
        this.$router.push(
          {
            name: 'streaming',
            params: { countryOrCategoryOrUuid: country.toLowerCase() }
          }
        );
      }
    },
    selectedSortBy: {
      get() {
        return this.$store.state.streams.selectedSortBy;
      },
      set(value) {
        this.$store.dispatch('sortBySelection', value);
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
      // otherwise it's just the setup
      if (country !== this.selectedCountry) {
        this.$gtag.event(GTAG_STREAMING_ACTION_FILTER_COUNTRY, {
          event_category: GTAG_CATEGORY_STREAMING,
          event_label: country.toLowerCase(),
          value: GTAG_STREAMING_FILTER_VALUE
        });
      }
    },
    sortByChange(sortBy) {
      // otherwise it's just the setup
      if (sortBy !== this.selectedSortBy) {
        this.$gtag.event(GTAG_STREAMING_ACTION_FILTER_SORT, {
          event_category: GTAG_CATEGORY_STREAMING,
          event_label: sortBy.code,
          value: GTAG_STREAMING_FILTER_VALUE
        });
      }
    },
    playRandom() {
      this.$gtag.event(GTAG_ACTION_PLAY_RANDOM, {
        event_category: GTAG_CATEGORY_STREAMING,
        event_label: 'random',
        value: GTAG_ACTION_PLAY_VALUE
      });

      this.$store.dispatch('playRandom');
    }
  }
};
</script>
