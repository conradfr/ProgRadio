<template>
  <div class="program-container" :class="{ 'prevday': startsPrevDay, 'nextday': endsNextDay }"
       :style="containerStyle" v-on:mouseup="detailClick">
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
      <div class="program-inner" v-bind:title="title">
        <div class="program-img" v-if="program.picture_url && (hover || isCurrent)" v-once>
          <img v-bind:src="program.picture_url | picture" alt="" @mousedown.prevent="">
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
import { DateTime, Interval } from 'luxon';
import { mapState } from 'vuex';
import { TIMEZONE, THUMBNAIL_PROGRAM_PATH, PROGRAM_LONG_ENOUGH } from '../../config/config';

import ScheduleRadioSection from './ScheduleRadioSection.vue';

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
    title() {
      let { title } = this.program;

      if (this.program.host) {
        title += ` - ${this.program.host}`;
      }

      if (this.program.description) {
        title += ` - ${this.program.description}`;
      }

      title += ` (${this.scheduleDisplay})`;

      return title;
    },
    scheduleDisplay() {
      const start = DateTime.fromSQL(this.program.start_at)
        .setZone(TIMEZONE).toLocaleString(DateTime.TIME_SIMPLE);
      const end = DateTime.fromSQL(this.program.end_at)
        .setZone(TIMEZONE).toLocaleString(DateTime.TIME_SIMPLE);

      return `${start}-${end}`;
    },
    isCurrent() {
      return Interval.fromDateTimes(DateTime.fromSQL(this.program.start_at).setZone(TIMEZONE),
        DateTime.fromSQL(this.program.end_at).setZone(TIMEZONE)).contains(this.cursorTime);
    },
    isLongEnough() {
      return this.program.duration >= PROGRAM_LONG_ENOUGH;
    },
    /* eslint-disable max-len */
    /* eslint-disable max-len */
    startsPrevDay() {
      return this.program.start_overflow;
      // return this.$store.state.schedule.scheduleDisplay[this.program.hash].container.prevDayOverflow;
    },
    endsNextDay() {
      return this.program.end_overflow;
      // return this.$store.state.schedule.scheduleDisplay[this.program.hash].container.nextDayOverflow;
    },
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
    picture: value => `${THUMBNAIL_PROGRAM_PATH}${value}`
  },
};
</script>
