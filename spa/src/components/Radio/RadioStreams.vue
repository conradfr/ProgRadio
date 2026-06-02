<template>
  <div class="col-12 radio-page-streams">
    <radio-stream :radio="radio" :stream="primaryStream"></radio-stream>
    <div class="d-none d-sm-block">
      <div v-if="secondaryStreams.length > 0" class="webradios-header">{{ $t('message.radio_page.webradios') }}</div>
        <radio-stream v-for="stream in secondaryStreams" :key="stream.code_name"
          :radio="radio" :stream="stream"></radio-stream>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'pinia';
import type { PropType } from 'vue';
import filter from 'lodash/filter';

import type { Radio } from '@/types/radio';

import { useScheduleStore } from '@/stores/scheduleStore';

import RadioStream from './RadioStream.vue';


export default defineComponent({
  components: {
    RadioStream
  },
  props: {
    radio: {
      type: Object as PropType<Radio>,
      required: true
    }
  },
  computed: {
    ...mapState(useScheduleStore, ['getSubRadio']),
    primaryStream() {
      return this.getSubRadio(this.radio.code_name);
    },
    secondaryStreams() {
      return filter(this.radio.streams, r => r.code_name !== this.primaryStream.code_name);
    },
  }
});
</script>
