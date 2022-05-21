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
        :radio="entry"
        :displayNoSchedule="displayNoSchedule"
        :schedule="getSchedule(entry.code_name)"
        :hasSchedule="hasSchedule(entry.code_name)"
      >
      </schedule-radio-grid-row>
    </vue3-hammer>
    <schedule-radio-grid-no-radio
        v-if="radios.length === 0 && isLoading === false"
        :collection="currentCollection">
    </schedule-radio-grid-no-radio>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapActions } from 'pinia';

import { NAV_MOVE_BY } from '@/config/config';

/* eslint-disable import/no-cycle */
import { useGlobalStore } from '@/stores/globalStore';
import { useScheduleStore } from '@/stores/scheduleStore';

import type { ScheduleOfRadio } from '@/types/schedule';

import Vue3Hammer from '../Utils/Vue3Hammer.vue';
import TimelineCursor from './TimelineCursor.vue';
import ScheduleRadioGridRow from './ScheduleRadioGridRow.vue';
import ScheduleRadioGridNoRadio from './ScheduleRadioGridNoRadio.vue';

export default defineComponent({
  components: {
    Vue3Hammer,
    TimelineCursor,
    ScheduleRadioGridRow,
    ScheduleRadioGridNoRadio
  },
  /* eslint-disable indent */
  data(): {
    clickX: number|null,
    swipeActive: boolean
  } {
    return {
      clickX: null,
      swipeActive: false
    };
  },
  computed: {
    ...mapState(useGlobalStore, ['isLoading']),
    ...mapState(useScheduleStore, { radios: 'rankedRadios', displayNoSchedule: 'hasSchedule' }),
    ...mapState(useScheduleStore, [
      'schedule',
      'gridIndexTransform',
      'scrollClick',
      'currentCollection'
    ]),
    styleObject() {
      const styleObject: any = {
        // left: this.$store.getters.gridIndexLeft.left
        transform: this.gridIndexTransform.transform
      };

      // disable grid transition while manually scrolling, avoid lag effect
      if (this.scrollClick) {
        styleObject.transition = 'none';
      }

      return styleObject;
    },
  },
  /* @note scroll inspired by https://codepen.io/pouretrebelle/pen/cxLDh */
  methods: {
    ...mapActions(useScheduleStore, ['scroll', 'setScrollClick']),
    getSchedule(radio: string): ScheduleOfRadio {
      return this.schedule[radio];
    },
    hasSchedule(radio: string): boolean {
      return (this.schedule[radio]
          && Object.keys(this.schedule[radio]).length > 0) || false;
    },
    onSwipe(event: Event) {
      this.swipeActive = true;
      setTimeout(this.swipeEnd, 1000);

      // avoid ghost click
      //  if (this.clickX !== null /* || ([2,4].indexOf(event.direction) === -1)*/) { return; }

      const amount = (NAV_MOVE_BY / 2.2) * (event as any).velocityX * -1;
      this.scroll(amount);
    },
    swipeEnd() {
      this.swipeActive = false;
    },
    onPanStart() {
      if (this.swipeActive) {
        return;
      }

      this.setScrollClick(true);
      this.clickX = 0;
    },
    onPanEnd() {
      if (this.swipeActive) {
        return;
      }

      this.setScrollClick(false);
    },
    onPan(event: any) {
      if (this.swipeActive) {
        return;
      }

      // preventing vertical scrolling to generate horizontal panning
      if ((event.angle <= -25 && event.angle >= -135) || (event.angle > 15 && event.angle <= 135)
        || event.overallVelocityX > 5 || event.overallVelocityX < -5) {
        return;
      }

      const scroll = -1 * (event.deltaX - (this.clickX + event.overallVelocityX));
      this.scroll(scroll);
      this.clickX = event.deltaX;
    }
  }
});
</script>
