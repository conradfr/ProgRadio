<template>
  <div>
    <collection-switcher></collection-switcher>
    <timeline></timeline>
    <timeline-cursor-head></timeline-cursor-head>
    <schedule-container ref="container"></schedule-container>
    <category-filter v-if="displayCategoryFilter"/>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import ScheduleUtils from '../utils/ScheduleUtils';
import { COLLECTION_FAVORITES } from '../config/config';

import CollectionSwitcher from './CollectionSwitcher.vue';
import Timeline from './Timeline.vue';
import TimelineCursorHead from './TimelineCursorHead.vue';
import ScheduleContainer from './ScheduleContainer.vue';
import CategoryFilter from './CategoryFilter.vue';

export default {
  components: {
    CollectionSwitcher,
    Timeline,
    TimelineCursorHead,
    ScheduleContainer,
    CategoryFilter
  },
  mounted() {
    // set focus on the schedule container to allow key nav.
    this.$refs.container.$el.focus();
  },
  computed: {
    ...mapGetters([
      'displayCategoryFilter'
    ]),
    ...mapState({
      radios: state => state.schedule.radios
    })
  },
  watch: {
    // update the collection menu that is outside the Vue app for now
    radios(val) {
      const favorites = ScheduleUtils.filterRadiosByCollection(val, COLLECTION_FAVORITES);
      const menuItem = document.getElementById(`collections-menu-${COLLECTION_FAVORITES}`);

      if (favorites.length === 0) {
        menuItem.classList.add('disabled');
      } else {
        menuItem.classList.remove('disabled');
      }
    },
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
