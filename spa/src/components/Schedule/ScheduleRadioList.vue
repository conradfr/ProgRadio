<template>
  <div v-if="radios.length > 0" class="schedule-radio-list">
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

import { useScheduleStore } from '@/stores/scheduleStore';

import ScheduleRadioListOne from './ScheduleRadioListOne.vue';

export default defineComponent({
  components: { ScheduleRadioListOne },
  computed: mapState(useScheduleStore, { radios: 'rankedRadios' }),
});
</script>
