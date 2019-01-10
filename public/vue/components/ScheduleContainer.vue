<template>
  <div class="schedule-container" tabindex="-1"
       v-on:keyup.left.prevent="keyLeft()"
       v-on:keyup.right.prevent="keyRight()">
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
  methods: {
    keyLeft() {
      this.$store.dispatch('scrollBackward');
    },
    keyRight() {
      this.$store.dispatch('scrollForward');
    }
  },
  created() {
    this.$store.dispatch('getSchedule');
  }
};
</script>
