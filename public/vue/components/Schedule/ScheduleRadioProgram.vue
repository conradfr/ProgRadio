<template>
  <div class="program-container" :data-hash="program.hash"
     :class="{ 'prevday': startsPrevDay, 'nextday': endsNextDay }"
     :style="containerStyle" ref="root">
    <div class="program" @mouseover.once="hover = !hover"
         v-if="isIntersecting === true"
         v-bind:class="{ 'program-current': isCurrent, 'long-enough': isLongEnough }">
      <div class="program-inner" v-bind:title="title">
        <div class="program-img" v-if="program.picture_url && (hover || isCurrent)">
          <img v-bind:src="picturePath" alt="" @mousedown.prevent="" v-once>
        </div>
        <div class="program-infos" :style="infosStyle">
          <div class="program-title" v-once>
            <span class="schedule-display" >{{ scheduleDisplay }}</span>{{ program.title }}
          </div>
          <div class="program-host" v-once>{{ program.host }}</div>
          <div class="program-description-short"
               v-bind:class="{ 'program-description-nohost': !program.host }">
            <div class="program-description-short-inner">
              <span class="program-description-short-inner-song"
                  v-if="isCurrent && radioPlaying && currentSong">
                <i class="bi bi-music-note-beamed"></i>
                {{ currentSong }}
              </span>
              <span class="program-description-short-inner-text" v-once>
                {{ shorten(program.description, program.duration) }}
              </span>
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
import { mapState, mapGetters } from 'vuex';
import { TIMEZONE, THUMBNAIL_PROGRAM_PATH, PROGRAM_LONG_ENOUGH } from '../../config/config';

import ScheduleRadioSection from './ScheduleRadioSection.vue';

export default {
  compatConfig: {
    MODE: 3
  },
  components: { ScheduleRadioSection },
  props: ['program', 'radioPlaying', 'intersectionObserver', 'isIntersecting'],
  data() {
    return {
      hover: false
    };
  },
  mounted() {
    this.intersectionObserver.observe(this.$refs.root);
  },
  beforeUnmount() {
    this.intersectionObserver.unobserve(this.$refs.root);
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
    ...mapGetters([
      'currentSong'
    ]),
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
      const start = DateTime.fromISO(this.program.start_at)
        .setZone(TIMEZONE).toLocaleString(DateTime.TIME_SIMPLE);
      const end = DateTime.fromISO(this.program.end_at)
        .setZone(TIMEZONE).toLocaleString(DateTime.TIME_SIMPLE);

      return `${start}-${end}`;
    },
    isCurrent() {
      return Interval.fromDateTimes(DateTime.fromISO(this.program.start_at).setZone(TIMEZONE),
        DateTime.fromISO(this.program.end_at).setZone(TIMEZONE)).contains(this.cursorTime);
    },
    isLongEnough() {
      return this.program.duration >= PROGRAM_LONG_ENOUGH;
    },
    /* eslint-disable max-len */
    startsPrevDay() {
      return this.program.start_overflow;
      // return this.$store.state.schedule.scheduleDisplay[this.program.hash].container.prevDayOverflow;
    },
    endsNextDay() {
      return this.program.end_overflow;
      // return this.$store.state.schedule.scheduleDisplay[this.program.hash].container.nextDayOverflow;
    },
    picturePath() {
      return `${THUMBNAIL_PROGRAM_PATH}${this.program.picture_url}`;
    }
  },
  methods: {
    shorten(value, duration) {
      if (value === null) {
        return '';
      }
      if (duration < 15) {
        return '';
      }

      return value.split('\n')[0];
    },
  }
};
</script>
