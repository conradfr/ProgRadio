<template>
  <div class="schedule-container" tabindex="-1">
    <schedule-radio-grid-loading></schedule-radio-grid-loading>
    <schedule-radio-list></schedule-radio-list>
    <schedule-radio-grid></schedule-radio-grid>
  </div>
</template>

<script>
import ScheduleRadioList from './ScheduleRadioList.vue';
import ScheduleRadioGrid from './ScheduleRadioGrid.vue';
import ScheduleRadioGridLoading from './ScheduleRadioGridLoading.vue';

export default {
  components: {
    ScheduleRadioList,
    ScheduleRadioGrid,
    ScheduleRadioGridLoading
  },
  created() {
    this.$store.dispatch('getSchedule');
  }
};
</script>
