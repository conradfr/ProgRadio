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

import { COLLECTION_FAVORITES, PLAYER_TYPE_RADIO } from '../config/config';

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

    document.title = this.$i18n.tc('message.schedule.title');
  },
  beforeDestroy() {
    const body = document.querySelector('body');
    body.classList.remove('body-app');
    body.classList.remove('body-app-schedule');
  },
  computed: {
    ...mapGetters([
      'displayCategoryFilter',
      'currentSong'
    ]),
    ...mapState({
      collections: state => state.schedule.collections,
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
    },
    // update the collection menu that is outside the Vue app for now
    collections: {
      deep: true,
      handler(newVal) {
        const menuItem = document.getElementById(`collections-menu-${COLLECTION_FAVORITES}`);
        const topMenuItem = document.getElementById(`collections-top-menu-${COLLECTION_FAVORITES}`);

        if (newVal[COLLECTION_FAVORITES] === undefined
            || newVal[COLLECTION_FAVORITES].radios.length === 0) {
          menuItem.classList.add('disabled');
          topMenuItem.classList.add('hidden');
        } else {
          menuItem.classList.remove('disabled');
          topMenuItem.classList.remove('hidden');
        }
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
