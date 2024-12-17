<template>
<!--  <TransitionGroup name="radio-list" tag="div" class="schedule-radio-list">-->
  <div class="schedule-radio-list">
    <schedule-radio-list-one
        v-for="entry in radios"
        :key="entry.code_name"
        :radio="entry">
    </schedule-radio-list-one>
  </div>
<!--  </TransitionGroup>-->
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'pinia';

/* eslint-disable import/no-cycle */
import { useScheduleStore } from '@/stores/scheduleStore';

import ScheduleRadioListOne from './ScheduleRadioListOne.vue';

export default defineComponent({
  components: { ScheduleRadioListOne },
  computed: mapState(useScheduleStore, { radios: 'rankedRadios' }),
});
</script>
