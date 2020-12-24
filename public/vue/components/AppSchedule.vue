<template>
  <div v-on:keyup.f="keyupFav">
    <collection-switcher></collection-switcher>
    <timeline></timeline>
    <timeline-cursor-head></timeline-cursor-head>
    <schedule-container ref="container"></schedule-container>
    <category-filter v-if="displayCategoryFilter"/>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import { COLLECTION_FAVORITES } from '../config/config';

import CollectionSwitcher from './Schedule/CollectionSwitcher.vue';
import Timeline from './Schedule/Timeline.vue';
import TimelineCursorHead from './Schedule/TimelineCursorHead.vue';
import ScheduleContainer from './Schedule/ScheduleContainer.vue';
import CategoryFilter from './Schedule/CategoryFilter.vue';

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

    const body = document.querySelector('body');
    body.classList.add('body-app');
    body.classList.add('body-app-schedule');
  },
  beforeDestroy() {
    const body = document.querySelector('body');
    body.classList.remove('body-app');
    body.classList.remove('body-app-schedule');
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
    radios() {
      // const favorites = ScheduleUtils.filterRadiosByCollection(val, COLLECTION_FAVORITES);
      const favorites = [];
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
    },
    keyupFav() {
      this.$store.dispatch('switchCollection', COLLECTION_FAVORITES);
    }
  }
};
</script>
