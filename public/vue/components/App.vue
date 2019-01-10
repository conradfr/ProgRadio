<template>
  <div id="app">
    <timeline></timeline>
    <timeline-cursor-head></timeline-cursor-head>
    <schedule-container ref="container"></schedule-container>
    <player></player>
    <category-filter v-if="displayCategoryFilter"/>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import Timeline from './Timeline.vue';
import TimelineCursorHead from './TimelineCursorHead.vue';
import ScheduleContainer from './ScheduleContainer.vue';
import Player from './Player.vue';
import CategoryFilter from './CategoryFilter.vue';

export default {
  components: {
    Timeline,
    TimelineCursorHead,
    ScheduleContainer,
    Player,
    CategoryFilter
  },
  mounted() {
    // set focus on the schedule container to allow key nav.
    this.$refs.container.$el.focus();
  },
  computed: mapGetters([
    'displayCategoryFilter'
  ])
};
</script>
