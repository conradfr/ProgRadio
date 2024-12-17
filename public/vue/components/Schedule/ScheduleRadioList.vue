<template>
  <div class="schedule-radio-list" v-if="radios.length > 0">
    <schedule-radio-list-one
        v-for="entry in radios"
        :key="entry.code_name"
        :radio="entry">
    </schedule-radio-list-one>
  </div>
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
