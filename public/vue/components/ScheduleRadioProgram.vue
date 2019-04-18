<template>
  <div class="program-container" :style="containerStyle" v-on:mouseup="detailClick">
    <!--        <div class="program program-full" :style="styleObjectDetail">
                <div class="program-inner">
                    <div class="program-title"><span class="schedule-display">
                      {{ scheduleDisplay}}</span>{{ program.title }}</div>
                    <div class="program-host">{{ program.host  }}</div>
                    <div class="program-description">{{ program.description }}</div>
                </div>
            </div>-->
    <div class="program" v-on:mouseover.once="hover = !hover"
         v-bind:class="{ 'program-current': isCurrent, 'long-enough': isLongEnough }">
      <div class="program-inner">
        <div class="program-img" v-if="program.picture_url && (hover || isCurrent)">
          <img v-bind:src="program.picture_url | picture" alt="" @mousedown.prevent="" v-once>
        </div>
        <div class="program-infos" :style="infosStyle">
          <div class="program-title" v-once>
            <span class="schedule-display">{{ scheduleDisplay }}</span>{{ program.title }}
          </div>
          <div class="program-host">{{ program.host }}</div>
          <div class="program-description-short"
               v-bind:class="{ 'program-description-nohost': !program.host }" v-once>
            <div class="program-description-short-inner">
              {{ program.description | shorten(program.duration) }}
            </div>
          </div>
        </div>
        <schedule-radio-section v-for="entry in program.sections" :key="entry.hash"
          :program_start="program.start_at" :section="entry" v-once>
        </schedule-radio-section>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import { THUMBNAIL_PATH, PROGRAM_LONG_ENOUGH } from '../config/config';

import ScheduleRadioSection from './ScheduleRadioSection.vue';

const moment = require('moment');

export default {
  components: { ScheduleRadioSection },
  props: ['program'],
  data() {
    return {
      hover: false,
      displayDetail: false
    };
  },
  computed: {
    ...mapState({
      cursorTime: state => state.schedule.cursorTime,
      containerStyle(state) {
        const data = state.schedule.scheduleDisplay[this.program.hash].container;
        const width = `${data.width}px`;

        return {
          left: `${data.left}px`,
          width,
          minWidth: width,
          maxWidth: width
        };
      },
      infosStyle(state) {
        const left = state.schedule.scheduleDisplay[this.program.hash].textLeft;

        return {
          // position: 'relative',
          // transform: `translateX(${left}px)`
          marginLeft: `${left}px`
        };
      }
    }),
    scheduleDisplay() {
      const format = 'HH[h]mm';
      const start = moment(this.program.start_at).format(format);
      const end = moment(this.program.end_at).format(format);

      return `${start}-${end}`;
    },
    isCurrent() {
      return this.cursorTime.isBetween(moment(this.program.start_at), moment(this.program.end_at));
    },
    isLongEnough() {
      return this.program.duration >= PROGRAM_LONG_ENOUGH;
    }
  },
  methods: {
    detailClick() {
      // this.displayDetail = !this.displayDetail;
    }
  },
  filters: {
    shorten(value, duration) {
      if (value === null) {
        return '';
      }
      if (duration < 15) {
        return '';
      }

      return value.split('\n')[0];
    },
    picture: value => `${THUMBNAIL_PATH}${value}`
  },
};
</script>
