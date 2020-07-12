<template>
  <div class="container">
      <loading></loading>
      <div class="row">
        <div class="col-md-12">
<!--          <h4>Streaming</h4>-->
          <streams-list-filters></streams-list-filters>
          <div class="streams">
            <streams-list-one
              v-for="entry in radios"
              :key="entry.code_name"
              :radio="entry"
            ></streams-list-one>
          </div>
          <streams-list-pagination></streams-list-pagination>
        </div>
      </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

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
    this.$store.dispatch('getStreamRadios');
  },
  computed: {
    ...mapState({
      radios: state => state.streams.streamRadios,
    })
  },
};
</script>
