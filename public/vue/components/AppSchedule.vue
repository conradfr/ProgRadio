<template>
  <div v-on:keyup.f="keyupFav" style="overflow-x: hidden; padding: 0 0 !important">
    <collection-switcher></collection-switcher>
    <timeline></timeline>
    <timeline-cursor-head v-if="rankedRadios.length > 0"></timeline-cursor-head>
    <schedule-container ref="container"></schedule-container>
    <category-filter v-if="displayCategoryFilter"/>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import { COLLECTION_FAVORITES, PLAYER_TYPE_RADIO } from '../config/config';

// import ScheduleStore from '../store/ScheduleStore';
import CollectionSwitcher from './Schedule/CollectionSwitcher.vue';
import Timeline from './Schedule/Timeline.vue';
import TimelineCursorHead from './Schedule/TimelineCursorHead.vue';
import ScheduleContainer from './Schedule/ScheduleContainer.vue';
import CategoryFilter from './Schedule/CategoryFilter.vue';

export default {
  compatConfig: {
    MODE: 3
  },
  components: {
    CollectionSwitcher,
    Timeline,
    TimelineCursorHead,
    ScheduleContainer,
    CategoryFilter
  },
  /* created() {
    this.$store.registerModule('schedule', ScheduleStore);
  }, */
  mounted() {
    // set focus on the schedule container to allow key nav.
    this.$refs.container.$el.focus();

    const body = document.querySelector('body');
    body.classList.add('body-app');
    body.classList.add('body-app-schedule');

    document.title = this.$i18n.tc('message.schedule.title');
  },
  beforeUnmount() {
    const body = document.querySelector('body');
    body.classList.remove('body-app');
    body.classList.remove('body-app-schedule');
  },
  computed: {
    ...mapGetters([
      'displayCategoryFilter',
      'currentSong',
      'rankedRadios'
    ]),
    ...mapState({
      playingRadio: state => state.player.radio,
      playingShow: state => state.player.show,
      playing: state => state.player.playing
    })
  },
  /* eslint-disable func-names */
  watch: {
    playing() {
      this.updateTitle();
    },
    playingShow() {
      this.updateTitle();
    },
    currentSong() {
      this.updateTitle();
    }
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
    },
    updateTitle() {
      if (this.playing === true && this.playingRadio
          && this.playingRadio.type === PLAYER_TYPE_RADIO) {
        let preTitle = '♫ ';
        if (this.currentSong) {
          preTitle += `${this.currentSong} - `;
        }

        if (this.playingShow) {
          preTitle += `${this.playingShow.title} - `;
        }

        preTitle += `${this.playingRadio.name} - `;

        document.title = `${preTitle}${this.$i18n.tc('message.schedule.title')}`;
      } else {
        document.title = this.$i18n.tc('message.schedule.title');
      }
    }
  }
};
</script>
