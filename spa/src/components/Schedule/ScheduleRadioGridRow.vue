<template>
  <div class="schedule-radio-grid-row">
    <div v-if="!hasSchedule && displayNoSchedule && isLoading === false"
         class="program-container none" :style="noProgramStyleObject">
      <div class="program">
        <div class="program-inner">{{ $t('message.schedule.no_schedule') }}</div>
      </div>
    </div>
    <template v-if="hasSchedule">
      <schedule-radio-program
        v-for="(entry, key) in schedule"
        :key="key"
        :radio="radio"
        :program="entry"
        :intersectionObserver="intersectionObserver"
        :isIntersecting="intersected.indexOf(entry.hash) !== -1"
        :radioPlaying="playing && playingStreamCodeName === `${radio.code_name}_main`">
      </schedule-radio-program>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { mapState } from 'pinia';

import type { Radio } from '@/types/radio';
import type { ScheduleOfSubRadio } from '@/types/schedule';

import { useGlobalStore } from '@/stores/globalStore';
import { useScheduleStore } from '@/stores/scheduleStore';
import { usePlayerStore } from '@/stores/playerStore';

import ScheduleRadioProgram from './ScheduleRadioProgram.vue';

export default defineComponent({
  components: { ScheduleRadioProgram },
  props: {
    radio: {
      type: Object as PropType<Radio>,
      required: true
    },
    schedule: {
      type: Object as PropType<ScheduleOfSubRadio>,
      required: true
    },
    displayNoSchedule: Boolean,
    hasSchedule: Boolean
  },
  data(): {
    intersected: string[],
    intersectionObserver: IntersectionObserver|null
  } {
    return {
      intersected: [],
      intersectionObserver: null,
    };
  },
  beforeMount() {
    this.intersectionObserver = new IntersectionObserver(this.handleIntersection);
  },
  computed: {
    ...mapState(useGlobalStore, ['isLoading']),
    ...mapState(useScheduleStore, ['scrollIndex']),
    ...mapState(usePlayerStore, {
      playing: 'playing',
      playingStreamCodeName: 'radioStreamCodeName'
    }),
    noProgramStyleObject() {
      return {
        left: `${this.scrollIndex}px`,
      };
    }
  },
  methods: {
    handleIntersection(entries: any[]) {
      entries.forEach((entry) => {
        const indexOfEntry = this.intersected.indexOf(entry.target.dataset.hash);
        if (entry.isIntersecting === true && indexOfEntry === -1) {
          this.intersected.push(entry.target.dataset.hash);
        } else if (indexOfEntry !== -1) {
          this.intersected.splice(indexOfEntry, 1);
        }
      });
    },
  }
});
</script>
