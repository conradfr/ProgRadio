<template>
  <div class="col-md-12 col-xs-6 schedule-page-streams">
    <radio-stream :radio="radio" :stream="primaryStream"></radio-stream>
    <div v-if="secondaryStreams.length > 0"
         class="webradios-header">{{ $t('message.radio_page.webradios') }}</div>
    <radio-stream
        v-for="stream in secondaryStreams" :key="stream.code_name"
        :radio="radio" :stream="stream"></radio-stream>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import filter from 'lodash/filter';

import RadioStream from './RadioStream.vue';

export default {
  props: ['radio'],
  components: {
    RadioStream
  },
  computed: {
    ...mapState({

    }),
    primaryStream() {
      return filter(this.radio.streams, r => r.main === true)[0];
    },
    secondaryStreams() {
      return filter(this.radio.streams, r => r.main === false);
    },
  }
};
</script>
