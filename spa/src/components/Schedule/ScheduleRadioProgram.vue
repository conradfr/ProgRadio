<template>
  <div :ref="setRootRef"
     class="program-container"
     :data-hash="program.hash"
     :class="{ 'prevday': startsPrevDay, 'nextday': endsNextDay }"
     :style="containerStyle"
     @click.stop="detailClick">
    <div v-if="isIntersecting === true" class="program"
      :class="{ 'program-unknown': isUnknown, 'program-current': isCurrent, 'long-enough': isLongEnough }"
      @mouseover.once="hover = !hover">
      <div class="program-inner" :title="title">
        <div v-if="program.picture_url && (hover || isCurrent)" class="program-img">
          <img v-once :src="picturePath" alt="" @mousedown.prevent="">
        </div>
        <div class="program-infos" :style="infosStyle">
          <div v-once class="program-title">
            <span class="schedule-display">{{ timeDisplay }}</span>{{ program.title }}
          </div>
          <div v-if="program.host" v-once class="program-host">{{ program.host }}</div>
          <div class="program-description-short"
            :class="{ 'program-description-nohost': !program.host }">
            <div class="program-description-short-inner">
              <span v-if="radio.streaming_enabled === true && isCurrent && liveSongText"
                class="program-description-short-inner-song">
                <i class="bi bi-music-note-beamed"></i>
                {{ liveSongText }}
              </span>
              <span v-if="program.description" v-once class="program-description-short-inner-text"
                :class="{ 'program-description-short-inner-text-current': isCurrent }">
                {{ shorten(program.description, program.duration) }}
              </span>
            </div>
          </div>
        </div>
        <schedule-radio-section v-for="entry in program.sections" v-once :key="entry.hash"
          :programStart="program.start_at" :section="entry">
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
  THUMBNAIL_PAGE_PROGRAM_PATH,
  GTAG_ACTION_PROGRAM_DETAIL,
  GTAG_ACTION_PROGRAM_DETAIL_VALUE,
  GTAG_CATEGORY_SCHEDULE
} from '@/config/config';

import { useScheduleStore } from '@/stores/scheduleStore';
import { usePlayerStore } from '@/stores/playerStore';

import type { Radio } from '@/types/radio';
import type { Stream } from '@/types/streams';
import type { Program } from '@/types/program';

import ScheduleRadioSection from './ScheduleRadioSection.vue';
import PlayerUtils from "@/utils/PlayerUtils";

const MAX_RANDOM_MS = 150;

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
    intersectionObserver: {
      type: Object as PropType<IntersectionObserver>,
      required: true
    },
    isIntersecting: Boolean
  },
  data(): {
    subRadio: Stream|null,
    channelName: string|null
    hover: boolean,
    rootRef: HTMLElement|null,
    displayModal: boolean,
    modal: any|null
  } {
    return {
      subRadio: null,
      channelName: null,
      hover: false,
      rootRef: null,
      displayModal: false,
      modal: null
    };
  },
  mounted() {
    this.subRadio = this.getSubRadio(this.radio.code_name);

    if (this.rootRef !== null) {
      this.intersectionObserver.observe(this.rootRef);
    }

    if (this.isCurrent) {
      this.joinChannels();
    }
  },
  beforeUnmount() {
    if (this.rootRef !== null) {
      this.intersectionObserver.unobserve(this.rootRef);
    }

    if (this.isCurrent) {
      this.leaveChannels();
    }
  },
  watch: {
    isCurrent(newValue) {
      if (newValue) {
        this.joinChannels();
      } else {
        this.leaveChannels();
      }
    },
  },
  computed: {
    ...mapState(usePlayerStore, ['song']),
    ...mapState(useScheduleStore, [
      'cursorTime',
      'scheduleDisplay',
      'swipeClick',
      'getSubRadio'
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

      if (!this.channelName) {
        this.setChannelName();
      }

      if (this.song[this.channelName] && this.song[this.channelName].song) {
        return PlayerUtils.formatSong(this.song[this.channelName].song);
      }

      return null;
    },
    isUnknown(): boolean {
      return this.program.unknown;
    },
    isCurrent(): boolean {
      return Interval.fromDateTimes(DateTime.fromISO(this.program.start_at).setZone(TIMEZONE),
        DateTime.fromISO(this.program.end_at).setZone(TIMEZONE)).contains(this.cursorTime);
    },
    isLongEnough(): boolean {
      return this.program.duration >= PROGRAM_LONG_ENOUGH;
    },
    startsPrevDay(): boolean {
      return this.program.start_overflow > 0;
      // return this.$store.state.schedule.scheduleDisplay[this.program.hash].container.prevDayOverflow;
    },
    endsNextDay(): boolean {
      return this.program.end_overflow > 0;
      // return this.$store.state.schedule.scheduleDisplay[this.program.hash].container.nextDayOverflow;
    },
    picturePath(): string {
      return this.program.picture_url.startsWith('http') ? this.program.picture_url
        // @ts-expect-error defined on global scope
        :`${this.$CDN_BASE_URL}${THUMBNAIL_PAGE_PROGRAM_PATH}${this.program.picture_url}`;
    }
  },
  methods: {
    ...mapActions(useScheduleStore, [
      'activateProgramModal',
    ]),
    ...mapActions(usePlayerStore, [
      'joinChannel',
      'leaveChannel',
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

      this.$gtag.event(GTAG_ACTION_PROGRAM_DETAIL, {
        event_category: GTAG_CATEGORY_SCHEDULE,
        event_label: this.program.title,
        value: GTAG_ACTION_PROGRAM_DETAIL_VALUE
      });

      this.activateProgramModal(this.program);
    },
    setChannelName() {
      this.channelName = PlayerUtils.getChannelName(this.subRadio, this.radio) || '';
    },
    joinChannels() {
      if (!this.channelName) {
        this.setChannelName();
      }

      setTimeout(() => {
        this.joinChannel(this.channelName);
      }, 250 + Math.floor(Math.random() * (MAX_RANDOM_MS - 50 + 1)) + 50);
    },
    leaveChannels() {
      if (!this.channelName) {
        this.setChannelName();
      }

      setTimeout(() => {
        this.leaveChannel(this.channelName);
      }, 1000 + Math.floor(Math.random() * (MAX_RANDOM_MS - 50 + 1)) + 50);
    },
  }
});
</script>
