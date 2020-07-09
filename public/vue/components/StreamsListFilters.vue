<template>
  <div class="container streams-filters-container">
    <div class="row">
      <div class="col-md-4 col-sm-12">
        <button class="btn btn-primary btn-sm" type="submit"
          v-on:click="playRandom">
          <span class="glyphicon glyphicon-play-circle" aria-hidden="true"></span>
          Jouer une radio au hasard
        </button>
      </div>
      <div class="col-select col-md-4 col-sm-6">
        <v-select
          @input="countryChange"
          :value="selectedCountry"
          :options="countriesOptions"
        >
          <template v-slot:option="option">
            <gb-flag
                :code="option.code"
                size="mini"
                v-if="option.code !== 'all'"
            />&nbsp;&nbsp;{{ option.label }}
          </template>
        </v-select>
      </div>
      <div class="col-select col-md-3 col-sm-6">
        <v-select
            @input="sortByChange"
            :value="selectedSortBy"
            :options="sortByOptions"
        >
        </v-select>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import Vue from 'vue';
import VueFlags from '@growthbunker/vueflags';
import vSelect from 'vue-select';

import {
  GTAG_CATEGORY_STREAMING,
  GTAG_STREAMING_ACTION_FILTER_COUNTRY,
  GTAG_STREAMING_ACTION_FILTER_SORT,
  GTAG_STREAMING_ACTION_PLAY_RANDOM,
  GTAG_STREAMING_FILTER_VALUE,
  GTAG_STREAMING_PLAY_VALUE,
} from '../config/config';

Vue.component('v-select', vSelect);

Vue.use(VueFlags, {
  // Specify the path of the folder where the flags are stored.
  iconPath: '/img/flags/',
});

export default {
  components: {

  },
  created() {
    this.$store.dispatch('getCountries');
  },
  computed: {
    ...mapGetters([
      'countriesOptions'
    ]),
    ...mapState({
      selectedCountry: state => state.streams.selectedCountry,
      selectedSortBy: state => state.streams.selectedSortBy,
      sortByOptions: state => state.streams.sortBy,
    })
  },
  methods: {
    countryChange(country) {
      this.$gtag.event(GTAG_STREAMING_ACTION_FILTER_COUNTRY, {
        event_category: GTAG_CATEGORY_STREAMING,
        value: GTAG_STREAMING_FILTER_VALUE
      });

      this.$store.dispatch('countrySelection', country);
    },
    sortByChange(sortBy) {
      this.$gtag.event(GTAG_STREAMING_ACTION_FILTER_SORT, {
        event_category: GTAG_CATEGORY_STREAMING,
        value: GTAG_STREAMING_FILTER_VALUE
      });

      this.$store.dispatch('sortBySelection', sortBy);
    },
    playRandom() {
      this.$gtag.event(GTAG_STREAMING_ACTION_PLAY_RANDOM, {
        event_category: GTAG_CATEGORY_STREAMING,
        value: GTAG_STREAMING_PLAY_VALUE
      });

      this.$store.dispatch('playRandom');
    }
  }
};
</script>
