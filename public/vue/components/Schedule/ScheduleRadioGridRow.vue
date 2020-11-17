<template>
  <div class="schedule-radio-grid-row">
    <div v-if="!hasSchedule && displayNoSchedule"
         class="program-container none" :style="noProgramStyleObject">
      <div class="program">
        <div class="program-inner">{{ $t('message.schedule.no_schedule') }}</div>
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
  props: ['radio', 'displayNoSchedule', 'schedule', 'hasSchedule'],
  computed: mapState({
    noProgramStyleObject(state) {
      return { left: `${state.schedule.scrollIndex}px` };
    },
  })
};
</script>
