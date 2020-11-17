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
import Loading from '../Loading.vue';

export default {
  components: {
    ScheduleRadioList,
    ScheduleRadioGrid,
    Loading
  },
  created() {
    setTimeout(
      () => {
        this.$store.dispatch('getRadiosData');
        this.$store.dispatch('getSchedule',
          {
            collection: this.$route.params.collection
              ? this.$route.params.collection : this.$store.state.schedule.currentCollection
          });
        if (this.$route.params.collection) {
          this.$store.dispatch('switchCollection', this.$route.params.collection);
        }
      },
      50
    );
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
