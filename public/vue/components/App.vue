<template>
  <div id="app"
       v-on:keyup.left.prevent="keyLeft()"
       v-on:keyup.right.prevent="keyRight()"
       v-on:keyup.media-track-previous.prevent="keyPlayPrevious"
       v-on:keyup.media-track-next.prevent="keyPlayNext"
       v-on:keyup.media-play-pause.prevent="keyPlayPause()">
    <collection-switcher></collection-switcher>
    <timeline></timeline>
    <timeline-cursor-head></timeline-cursor-head>
    <schedule-container ref="container"></schedule-container>
    <player></player>
    <category-filter v-if="displayCategoryFilter"/>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import throttle from 'lodash/throttle';

import CollectionSwitcher from './CollectionSwitcher.vue';
import Timeline from './Timeline.vue';
import TimelineCursorHead from './TimelineCursorHead.vue';
import ScheduleContainer from './ScheduleContainer.vue';
import Player from './Player.vue';
import CategoryFilter from './CategoryFilter.vue';

export default {
  components: {
    CollectionSwitcher,
    Timeline,
    TimelineCursorHead,
    ScheduleContainer,
    Player,
    CategoryFilter
  },
  created() {
    // OS hotkeys support
    if (navigator.mediaSession !== undefined) {
      navigator.mediaSession.setActionHandler('previoustrack', this.keyPlayPrevious.bind(this));
      navigator.mediaSession.setActionHandler('nexttrack', this.keyPlayNext.bind(this));
      navigator.mediaSession.setActionHandler('play', this.keyPlayPause.bind(this));
      navigator.mediaSession.setActionHandler('pause', this.keyPlayPause.bind(this));
    }
  },
  mounted() {
    // set focus on the schedule container to allow key nav.
    this.$refs.container.$el.focus();
  },
  computed: mapGetters([
    'displayCategoryFilter'
  ]),
  methods: {
    keyLeft() {
      this.$store.dispatch('scrollBackward');
    },
    keyRight() {
      this.$store.dispatch('scrollForward');
    },
    /* eslint-disable func-names */
    keyPlayPause: throttle(function () { this.$store.dispatch('togglePlay'); }, 200,
      { leading: true, trailing: false }),
    keyPlayPrevious: throttle(function () { this.$store.dispatch('playPrevious'); }, 200,
      { leading: true, trailing: false }),
    keyPlayNext: throttle(function () { this.$store.dispatch('playNext'); }, 200,
      { leading: true, trailing: false }),
  }
};
</script>
