<template>
  <div class="col-12 radio-page-streams">
    <radio-stream :radio="radio" :stream="primaryStream"></radio-stream>
    <div class="d-none d-sm-block">
      <div v-if="secondaryStreams.length > 0"
           class="webradios-header">{{ $t('message.radio_page.webradios') }}</div>
        <radio-stream
            v-for="stream in secondaryStreams" :key="stream.code_name"
            :radio="radio" :stream="stream"></radio-stream>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import filter from 'lodash/filter';

import RadioStream from './RadioStream.vue';

export default {
  compatConfig: {
    MODE: 3
  },
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
