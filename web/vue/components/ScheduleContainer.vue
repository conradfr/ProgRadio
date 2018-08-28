<template>
  <div class="schedule-container" tabindex="-1"
       v-on:keyup.left.prevent="keyLeft()"
       v-on:keyup.right.prevent="keyRight()">
    <schedule-radio-list></schedule-radio-list>
    <schedule-radio-grid></schedule-radio-grid>
  </div>
</template>

<script>
import ScheduleRadioList from './ScheduleRadioList.vue';
import ScheduleRadioGrid from './ScheduleRadioGrid.vue';

export default {
  components: {
    ScheduleRadioList,
    ScheduleRadioGrid
  },
  methods: {
    keyLeft() {
      this.$store.dispatch('scrollBackward');
    },
    keyRight() {
      this.$store.dispatch('scrollForward');
    }
  }
};
</script>
