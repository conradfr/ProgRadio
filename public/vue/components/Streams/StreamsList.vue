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

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'pinia';

/* eslint-disable import/no-cycle */
import { useGlobalStore } from '@/stores/globalStore';
import { useStreamsStore } from '@/stores/streamsStore';

import StreamsListPagination from './StreamsListPagination.vue';
import StreamsListOne from './StreamsListOne.vue';

export default defineComponent({
  components: {
    StreamsListPagination,
    StreamsListOne
  },
  computed: {
    ...mapState(useGlobalStore, ['isLoading']),
    ...mapState(useStreamsStore, {
      radios: 'streamRadios'
    })
  },
});
</script>
