<template>
  <div>
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
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import StreamsListPagination from './StreamsListPagination.vue';
import StreamsListOne from './StreamsListOne.vue';

export default {
  compatConfig: {
    MODE: 3
  },
  components: {
    StreamsListPagination,
    StreamsListOne
  },
  computed: {
    ...mapState({
      radios: state => state.streams.streamRadios,
    }),
    ...mapGetters({
      isLoading: 'isLoading'
    })
  },
};
</script>
