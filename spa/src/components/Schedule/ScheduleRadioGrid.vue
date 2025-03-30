<template>
  <div id="schedule-radio-grid" class="schedule-radio-grid" :style="styleObject">
    <timeline-cursor v-if="radios.length > 0"></timeline-cursor>
    <vue3-hammer
        :enabled="{ pan: true, swipe: true }"
        :panOptions="{ direction: 'horizontal' }"
        :swipeOptions="{ direction: 'horizontal' }"
        @swipe="onSwipe"
        @panleft="onPan" @panright="onPan"
        @panstart="onPanStart" @panend="onPanEnd">
      <schedule-radio-grid-row
        v-for="entry in radios"
        :key="entry.code_name"
        :radio="entry"
        :displayNoSchedule="displayNoSchedule"
        :schedule="getSchedule(entry.code_name)"
        :hasSchedule="hasSchedule(entry.code_name)">
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

import { useGlobalStore } from '@/stores/globalStore';
import { useUserStore } from '@/stores/userStore';
import { useScheduleStore } from '@/stores/scheduleStore';

import type { ScheduleOfSubRadio } from '@/types/schedule';

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
  data(): {
    clickX: number|null
  } {
    return {
      clickX: null
    };
  },
  computed: {
    ...mapState(useGlobalStore, ['isLoading']),
    ...mapState(useUserStore, { userSubRadios: 'subRadios' }),
    ...mapState(useScheduleStore, {
      allRadios: 'radios',
      radios: 'rankedRadios',
      displayNoSchedule: 'hasSchedule'
    }),
    ...mapState(useScheduleStore, [
      'schedule',
      'gridIndexTransform',
      'scrollClick',
      'swipeClick',
      'currentCollection',
      'getSubRadio'
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
    ...mapActions(useScheduleStore, ['scroll', 'setScrollClick', 'setSwipeClick']),
    getSchedule(radioCodeName: string): ScheduleOfSubRadio | Record<string, never> {
      if (!this.schedule[radioCodeName]) {
        return {};
      }

      const subRadioCodeName = this.getSubRadio(radioCodeName).code_name;

      if (!this.schedule[radioCodeName][subRadioCodeName]) {
        return {};
      }

      // @ts-ignore
      return this.schedule[radioCodeName][subRadioCodeName];
    },
    hasSchedule(radioCodeName: string): boolean {
      return Object.keys(this.getSchedule(radioCodeName)).length > 0;
    },
    onSwipe(event: Event) {
      this.setSwipeClick(true);
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      setTimeout(this.swipeEnd, 1000);

      // avoid ghost click
      //  if (this.clickX !== null /* || ([2,4].indexOf(event.direction) === -1)*/) { return; }

      const amount = (NAV_MOVE_BY / 2.2) * (event as any).velocityX * -1;
      this.scroll(amount);
    },
    swipeEnd() {
      this.setSwipeClick(false);
    },
    onPanStart() {
      if (this.swipeClick) {
        return;
      }

      this.setScrollClick(true);
      this.clickX = 0;
    },
    onPanEnd() {
      if (this.swipeClick) {
        return;
      }

      this.setScrollClick(false);
    },
    onPan(event: any) {
      if (this.swipeClick) {
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
