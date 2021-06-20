<template>
  <div class="container">
      <loading></loading>
      <div class="row">
        <div class="col-md-12">
          <streams-list-filters></streams-list-filters>
          <div class="streams d-flex justify-content-center" v-if="radios.length">
            <streams-list-one
              v-for="entry in radios"
              :key="entry.code_name"
              :radio="entry"
            ></streams-list-one>
          </div>
          <div class="row" v-else-if="isLoading === false">
            <div class="offset-md-3 col-md-6">
              <div class="alert alert-warning space-up-20 text-center" role="alert">
                {{ $t('message.streaming.no_results') }}</div>
            </div>
          </div>
          <streams-list-pagination v-if="radios.length"></streams-list-pagination>
        </div>
      </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import StreamsListFilters from './StreamsListFilters.vue';
import StreamsListPagination from './StreamsListPagination.vue';
import StreamsListOne from './StreamsListOne.vue';
import Loading from '../Utils/Loading.vue';

export default {
  compatConfig: {
    MODE: 3
  },
  components: {
    StreamsListFilters,
    StreamsListPagination,
    StreamsListOne,
    Loading
  },
  created() {
    if (this.$route.params.countryOrCategoryOrUuid) {
      if (this.$route.params.countryOrCategoryOrUuid.indexOf('-') !== -1) {
        this.$store.dispatch('getStreamRadio', this.$route.params.countryOrCategoryOrUuid);
      } else {
        this.$store.dispatch('countrySelection', this.$route.params.countryOrCategoryOrUuid);
      }
    } else {
      this.$store.dispatch('getStreamRadios');
    }
    this.$store.dispatch('getCountries');
  },
  computed: {
    ...mapGetters([
      'isLoading'
    ]),
    ...mapState({
      radios: state => state.streams.streamRadios,
    })
  },
};
</script>
