<template>
  <div v-if="currentShow" class="row mb-4 pb-2 border-bottom">
    <div class="col-2 col-md-1">
      <router-link :to="'/' + locale + '/radio/' + radio.code_name">
      <img class="img-fluid"
           :title="radio.name"
           :alt="radio.name"
           :src="picture">
      </router-link>
      <div v-if="radio.streaming_enabled" class="now-page-streams mt-3">
        <radio-stream :radio="radio" :stream="primaryStream"></radio-stream>
      </div>
    </div>
    <div class="col-10 col-md-11 now-page-show">
      <radio-show :show="currentShow"></radio-show>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { mapState } from 'pinia';
import { DateTime, Interval } from 'luxon';
import find from 'lodash/find';
import filter from 'lodash/filter';

import {
  TIMEZONE,
  THUMBNAIL_PAGE_PATH
} from '@/config/config';

import type { Radio } from '@/types/radio';

import { useScheduleStore } from '@/stores/scheduleStore';

import RadioShow from '../Radio/RadioShow.vue';
import RadioStream from '../Radio/RadioStream.vue';

export default defineComponent({
  components: {
    RadioShow,
    RadioStream,
  },
  props: {
    radio: {
      type: Object as PropType<Radio>,
      required: true
    }
  },
  data() {
    return {
      locale: this.$i18n.locale,
    };
  },
  computed: {
    ...mapState(useScheduleStore, ['cursorTime', 'schedule', 'getSubRadio']),
    primaryStream() {
      return filter(this.radio.streams, r => r.main === true)[0];
    },
    picture() {
      // @ts-expect-error defined on global scope
      // eslint-disable-next-line no-undef
      return `${cdnBaseUrl}${THUMBNAIL_PAGE_PATH}${this.radio.code_name}.png`;
    },
    currentShow() {
      const subRadio = this.getSubRadio(this.radio.code_name);
      const schedule = this.schedule[this.radio.code_name]
        ? this.schedule[this.radio.code_name][subRadio.code_name] : null;

      if (schedule === undefined || schedule === null) {
        return null;
      }

      return find(schedule, (program) => {
        return Interval.fromDateTimes(DateTime.fromISO(program.start_at).setZone(TIMEZONE),
          DateTime.fromISO(program.end_at).setZone(TIMEZONE)).contains(this.cursorTime);
      });
    },
  },
});
</script>
