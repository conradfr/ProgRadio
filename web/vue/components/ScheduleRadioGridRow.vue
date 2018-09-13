<template>
  <div class="schedule-radio-grid-row">
    <div v-if="!hasSchedule" class="program-container none" :style="noProgramStyleObject">
      <div class="program">
        <div class="program-inner">Programmes non disponibles :(</div>
      </div>
    </div>
    <template v-if="hasSchedule">
      <schedule-radio-program
        v-for="(entry, key) in schedule"
        :key="key"
        :program="entry">
      </schedule-radio-program>
    </template>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import ScheduleRadioProgram from './ScheduleRadioProgram.vue';

export default {
  components: { ScheduleRadioProgram },
  props: ['radio'],
  computed: mapState({
    noProgramStyleObject(state) {
      return { left: `${state.schedule.scrollIndex}px` };
    },
    schedule(state) {
      return state.schedule.schedule[this.radio];
    },
    hasSchedule(state) {
      return (state.schedule.schedule[this.radio]
        && Object.keys(state.schedule.schedule[this.radio]).length > 0) || false;
    }
  })
};
</script>
