<template>
  <div class="container">
      <loading></loading>
      <div class="row">
        <div class="col-md-12">
          <streams-list-filters></streams-list-filters>
          <div class="streams" v-if="radios.length">
            <streams-list-one
              v-for="entry in radios"
              :key="entry.code_name"
              :radio="entry"
            ></streams-list-one>
          </div>
          <div class="row" v-else-if="isLoading === false">
            <div class="col-md-offset-3 col-md-6">
              <div class="alert alert-warning space-up-20 text-center" role="alert">
                Aucunes radios</div>
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
import Loading from './Loading.vue';

export default {
  components: {
    StreamsListFilters,
    StreamsListPagination,
    StreamsListOne,
    Loading
  },
  created() {
    this.$store.dispatch('getCountries');
    if (this.$route.params.countryOrCategory) {
      this.$store.dispatch('countrySelection', this.$route.params.countryOrCategory);
    } else {
      this.$store.dispatch('getStreamRadios');
    }
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
