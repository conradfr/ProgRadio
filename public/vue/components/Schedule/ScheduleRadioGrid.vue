<template>
  <div id="schedule-radio-grid" class="schedule-radio-grid" :style="styleObject">
    <timeline-cursor v-if="radios.length > 0"></timeline-cursor>
    <vue3-hammer
        :enabled="{ pan: true, swipe: true }"
        :panOptions="{ direction: 'horizontal' }"
        :swipeOptions="{ direction: 'horizontal' }"
        v-on:swipe="onSwipe"
        v-on:panleft="onPan" v-on:panright="onPan"
        v-on:panstart="onPanStart" v-on:panend="onPanEnd">
      <schedule-radio-grid-row
        v-for="entry in radios"
        :key="entry.code_name"
        :radio_code_name="entry.code_name"
        :displayNoSchedule="displayNoSchedule"
        :schedule="getSchedule(entry.code_name)"
        :hasSchedule="hasSchedule(entry.code_name)"
      >
      </schedule-radio-grid-row>
    </vue3-hammer>
    <schedule-radio-grid-no-radio
        v-if="radios.length === 0"
        :collection="currentCollection">
    </schedule-radio-grid-no-radio>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import { NAV_MOVE_BY } from '../../config/config';

import Vue3Hammer from '../Utils/Vue3Hammer.vue';
import TimelineCursor from './TimelineCursor.vue';
import ScheduleRadioGridRow from './ScheduleRadioGridRow.vue';
import ScheduleRadioGridNoRadio from './ScheduleRadioGridNoRadio.vue';

export default {
  compatConfig: {
    MODE: 3
  },
  components: {
    Vue3Hammer,
    TimelineCursor,
    ScheduleRadioGridRow,
    ScheduleRadioGridNoRadio
  },
  data() {
    return {
      clickX: null,
      swipeActive: false
    };
  },
  computed: {
    styleObject() {
      const styleObject = {
        // left: this.$store.getters.gridIndexLeft.left
        transform: this.$store.getters.gridIndexTransform.transform
      };

      // disable grid transition while manually scrolling, avoid lag effect
      if (this.$store.state.schedule.scrollClick) {
        styleObject.transition = 'none';
      }

      return styleObject;
    },
    ...mapState({
      currentCollection: state => state.schedule.currentCollection
    }),
    ...mapGetters({
      radios: 'radiosRanked',
      displayNoSchedule: 'hasSchedule'
    })
  },
  /* @note scroll inspired by https://codepen.io/pouretrebelle/pen/cxLDh */
  methods: {
    getSchedule(radio) {
      return this.$store.state.schedule.schedule[radio];
    },
    hasSchedule(radio) {
      return (this.$store.state.schedule.schedule[radio]
          && Object.keys(this.$store.state.schedule.schedule[radio]).length > 0) || false;
    },
    onSwipe(event) {
      this.swipeActive = true;
      setTimeout(this.swipeEnd, 1000);

      // avoid ghost click
      //  if (this.clickX !== null /* || ([2,4].indexOf(event.direction) === -1)*/) { return; }

      const amount = (NAV_MOVE_BY / 2.2) * event.velocityX * -1;
      this.$store.dispatch('scroll', amount);
    },
    swipeEnd() {
      this.swipeActive = false;
    },
    onPanStart() {
      if (this.swipeActive === true) {
        return;
      }

      this.$store.dispatch('scrollClick', true);
      this.clickX = 0;
    },
    onPanEnd() {
      if (this.swipeActive === true) {
        return;
      }

      this.$store.dispatch('scrollClick', false);
    },
    onPan(event) {
      if (this.swipeActive === true) {
        return;
      }

      // preventing vertical scrolling to generate horizontal panning
      if ((event.angle <= -25 && event.angle >= -135) || (event.angle > 15 && event.angle <= 135)
        || event.overallVelocityX > 5 || event.overallVelocityX < -5) {
        return;
      }

      const scroll = -1 * (event.deltaX - (this.clickX + event.overallVelocityX));
      this.$store.dispatch('scroll', scroll);
      this.clickX = event.deltaX;
    }
  }
};
</script>
