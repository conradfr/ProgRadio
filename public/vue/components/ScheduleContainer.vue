<template>
  <div class="schedule-container" tabindex="-1">
    <loading></loading>
    <schedule-radio-list></schedule-radio-list>
    <schedule-radio-grid></schedule-radio-grid>
  </div>
</template>

<script>
import ScheduleRadioList from './ScheduleRadioList.vue';
import ScheduleRadioGrid from './ScheduleRadioGrid.vue';
import Loading from './Loading.vue';

export default {
  components: {
    ScheduleRadioList,
    ScheduleRadioGrid,
    Loading
  },
  created() {
    this.$store.dispatch('getSchedule', this.$route.params.collection || null);
    if (this.$route.params.collection) {
      this.$store.dispatch('switchCollection', this.$route.params.collection);
    }
  },
  watch: {
    $route(to, from) {
      if (to.params.collection !== undefined && to.params.collection !== from.params.collection) {
        this.$store.dispatch('switchCollection', to.params.collection);
      }
    }
  }
};
</script>
