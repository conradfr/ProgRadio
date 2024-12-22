<template>
  <div class="program-container" :data-hash="program.hash"
     :class="{ 'prevday': startsPrevDay, 'nextday': endsNextDay }"
     :style="containerStyle" :ref="setRootRef"
       v-on:click.stop="detailClick"
  >
    <div class="program" @mouseover.once="hover = !hover"
         v-if="isIntersecting === true"
         v-bind:class="{ 'program-current': isCurrent, 'long-enough': isLongEnough }">
      <div class="program-inner" v-bind:title="title">
        <div class="program-img" v-if="program.picture_url && (hover || isCurrent)">
          <img v-bind:src="picturePath" alt="" @mousedown.prevent="" v-once>
        </div>
        <div class="program-infos" :style="infosStyle">
          <div class="program-title" v-once>
            <span class="schedule-display" >{{ timeDisplay }}</span>{{ program.title }}
          </div>
          <div class="program-host" v-if="program.host" v-once>{{ program.host }}</div>
          <div class="program-description-short"
               v-bind:class="{ 'program-description-nohost': !program.host }">
            <div class="program-description-short-inner">
              <span class="program-description-short-inner-song"
                  v-if="radio.streaming_enabled === true && isCurrent && liveSongText">
                <i class="bi bi-music-note-beamed"></i>
                {{ liveSongText }}
              </span>
              <span class="program-description-short-inner-text"
                    v-bind:class="{ 'program-description-short-inner-text-current': isCurrent }"
                    v-if="program.description" v-once>
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

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { mapState, mapActions } from 'pinia';

import { DateTime, Interval } from 'luxon';
import {
  TIMEZONE,
  THUMBNAIL_PROGRAM_PATH,
  PROGRAM_LONG_ENOUGH,
  GTAG_ACTION_PROGRAM_DETAIL,
  GTAG_ACTION_PROGRAM_DETAIL_VALUE,
  GTAG_CATEGORY_SCHEDULE
} from '@/config/config';

/* eslint-disable import/no-cycle */
import { useScheduleStore } from '@/stores/scheduleStore';
import { usePlayerStore } from '@/stores/playerStore';

import type { Radio } from '@/types/radio';
import type { Program } from '@/types/program';

import ScheduleRadioSection from './ScheduleRadioSection.vue';

export default defineComponent({
  components: { ScheduleRadioSection },
  props: {
    radio: {
      type: Object as PropType<Radio>,
      required: true
    },
    program: {
      type: Object as PropType<Program>,
      required: true
    },
    radioPlaying: Boolean,
    intersectionObserver: {
      type: Object as PropType<IntersectionObserver>,
      required: true
    },
    isIntersecting: Boolean
  },
  /* eslint-disable indent */
  data(): {
    hover: boolean,
    rootRef: HTMLElement|null,
    displayModal: boolean,
    modal: any|null
  } {
    return {
      hover: false,
      rootRef: null,
      displayModal: false,
      modal: null
    };
  },
  mounted() {
    if (this.rootRef !== null) {
      this.intersectionObserver.observe(this.rootRef);
    }
  },
  beforeUnmount() {
    if (this.rootRef !== null) {
      this.intersectionObserver.unobserve(this.rootRef);
    }
  },
  computed: {
    ...mapState(usePlayerStore, ['currentSong', 'liveSong']),
    ...mapState(useScheduleStore, [
      'cursorTime',
      'scheduleDisplay',
      'swipeClick'
    ]),
    containerStyle() {
      const data = this.scheduleDisplay[this.program.hash].container;
      const width = `${data.width}px`;

      return {
        left: `${data.left}px`,
        width,
        minWidth: width,
        maxWidth: width
      };
    },
    infosStyle(): object {
      const left = this.scheduleDisplay[this.program.hash].textLeft;

      return {
        // position: 'relative',
        // transform: `translateX(${left}px)`
        marginLeft: `${left}px`
      };
    },
    title(): string {
      let { title } = this.program;

      if (this.program.host) {
        title += ` - ${this.program.host}`;
      }

      if (this.program.description) {
        title += ` - ${this.program.description}`;
      }

      title += ` (${this.timeDisplay})`;

      return title;
    },
    timeDisplay(): string {
      const start = DateTime.fromISO(this.program.start_at)
        .setZone(TIMEZONE).toLocaleString(DateTime.TIME_SIMPLE);
      const end = DateTime.fromISO(this.program.end_at)
        .setZone(TIMEZONE).toLocaleString(DateTime.TIME_SIMPLE);

      return `${start}-${end}`;
    },
    liveSongText(): string|null {
      if (!this.radio.streaming_enabled) {
        return null;
      }

      // current song of playing radio
      if (this.isCurrent && this.radioPlaying && this.currentSong) {
        return this.currentSong;
      }

      // else check if live song of this radio main steam
      return this.liveSong(this.radio, `${this.radio.code_name}_main`);
    },
    isCurrent(): boolean {
      return Interval.fromDateTimes(DateTime.fromISO(this.program.start_at).setZone(TIMEZONE),
        DateTime.fromISO(this.program.end_at).setZone(TIMEZONE)).contains(this.cursorTime);
    },
    isLongEnough(): boolean {
      return this.program.duration >= PROGRAM_LONG_ENOUGH;
    },
    /* eslint-disable max-len */
    startsPrevDay(): boolean {
      return this.program.start_overflow > 0;
      // return this.$store.state.schedule.scheduleDisplay[this.program.hash].container.prevDayOverflow;
    },
    endsNextDay(): boolean {
      return this.program.end_overflow > 0;
      // return this.$store.state.schedule.scheduleDisplay[this.program.hash].container.nextDayOverflow;
    },
    picturePath(): string {
      // @ts-expect-error defined on global scope
      // eslint-disable-next-line no-undef
      return `${cdnBaseUrl}${THUMBNAIL_PROGRAM_PATH}${this.program.picture_url}`;
    }
  },
  methods: {
    ...mapActions(useScheduleStore, [
      'activateProgramModal'
    ]),
    setRootRef(el: HTMLElement) {
      if (el) {
        this.rootRef = el;
      }
    },
    shorten(value :string|null, duration: number) {
      if (value === null) {
        return '';
      }
      if (duration < 15) {
        return '';
      }

      return value.split('\n')[0];
    },
    detailClick() {
      if (this.swipeClick === true) {
        return;
      }

      (this as any).$gtag.event(GTAG_ACTION_PROGRAM_DETAIL, {
        event_category: GTAG_CATEGORY_SCHEDULE,
        event_label: this.program.title,
        value: GTAG_ACTION_PROGRAM_DETAIL_VALUE
      });

      this.activateProgramModal(this.program);
    }
  }
});
</script>
