<template>
  <div v-on:keyup.f="keyupFav" style="overflow: hidden; padding: 0 0 !important">
    <collection-switcher></collection-switcher>
    <timeline></timeline>
    <timeline-cursor-head v-if="rankedRadios.length > 0"></timeline-cursor-head>
    <schedule-container :ref="setContainerRef"></schedule-container>
    <category-filter v-if="displayCategoryFilter"/>
    <adsense v-if="!userLogged" mode="horizontal_fix"></adsense>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapActions } from 'pinia';

/* eslint-disable import/no-cycle */
import { useScheduleStore } from '@/stores/scheduleStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useUserStore } from '@/stores/userStore';

import { COLLECTION_FAVORITES } from '@/config/config';

import typeUtils from '../utils/typeUtils';

import CollectionSwitcher from './Schedule/CollectionSwitcher.vue';
import Timeline from './Schedule/Timeline.vue';
import TimelineCursorHead from './Schedule/TimelineCursorHead.vue';
import ScheduleContainer from './Schedule/ScheduleContainer.vue';
import CategoryFilter from './Schedule/CategoryFilter.vue';
import Adsense from './Utils/Adsense.vue';

export default defineComponent({
  components: {
    CollectionSwitcher,
    Timeline,
    TimelineCursorHead,
    ScheduleContainer,
    CategoryFilter,
    Adsense
  },
  /* eslint-disable indent */
  data(): {
    containerRef: HTMLElement|null
  } {
    return {
      containerRef: null
    };
  },
  /* created() {
    this.$store.registerModule('schedule', ScheduleStore);
  }, */
  mounted() {
    // set focus on the schedule container to allow key nav.
    if (this.containerRef !== null) {
      (this.containerRef as any).$el.focus();
    }

    const body = document.querySelector('body')!;
    body.classList.add('body-app');
    body.classList.add('body-app-schedule');

    document.title = (this.$i18n as any).tc('message.schedule.title');
  },
  beforeUnmount() {
    const body = document.querySelector('body')!;
    body.classList.remove('body-app');
    body.classList.remove('body-app-schedule');
  },
  computed: {
    ...mapState(useUserStore, { userLogged: 'logged' }),
    ...mapState(useScheduleStore, ['displayCategoryFilter', 'rankedRadios']),
    ...mapState(usePlayerStore, {
      playingRadio: 'radio',
      playingShow: 'show',
      playing: 'playing',
      currentSong: 'currentSong'
    }),
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
    ...mapActions(useScheduleStore, ['scrollBackward', 'scrollForward', 'switchCollection']),
    setContainerRef(el: HTMLElement) {
      if (el) {
        this.containerRef = el;
      }
    },
    keyLeft() {
      this.scrollBackward();
    },
    keyRight() {
      this.scrollForward();
    },
    keyupFav() {
      this.switchCollection(COLLECTION_FAVORITES);
    },
    updateTitle() {
      if (this.playing === true && this.playingRadio
          && typeUtils.isRadio(this.playingRadio)) {
        let preTitle = '♫ ';
        if (this.currentSong) {
          preTitle += `${this.currentSong} - `;
        }

        if (this.playingShow) {
          preTitle += `${this.playingShow.title} - `;
        }

        preTitle += `${this.playingRadio.name} - `;

        document.title = `${preTitle}${(this.$i18n as any).tc('message.schedule.title')}`;
      } else {
        document.title = (this.$i18n as any).tc('message.schedule.title');
      }
    }
  }
});
</script>
