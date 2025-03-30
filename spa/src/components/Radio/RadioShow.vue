<template>
  <div v-once class="d-flex align-items-stretch" :class="{ 'media-current': isCurrent }">
    <a v-if="isCurrent" id="media-current" class="anchor"></a>
    <div class="flex-shrink-0 media-timeline">
      .
    </div>
    <div v-if="show.picture_url" class="flex-shrink-0">
      <img v-once alt="" class="img-fluid img-show mb-2" :src="picture">
    </div>
    <div class="flex-fill ps-3 mb-3">
      <h5 class="fw-bold mb-0">
        {{ scheduleDisplay }} - {{ show.title }}
      </h5>
      <div v-if="show.host" v-once>{{ show.host }}</div>
      <p v-if="show.description" v-once class="fw-light mt-2">{{ show.description }}</p>
      <div v-if="show.sections && show.sections.length > 0" class="mt-3">
        <radio-show-section v-for="entry in sectionsSorted" v-once :key="entry.hash"
          :section="entry">
        </radio-show-section>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { mapState } from 'pinia';
import { DateTime, Interval } from 'luxon';

import type { Program } from '@/types/program';
import type { Section } from '@/types/section';
import { TIMEZONE, THUMBNAIL_PAGE_PROGRAM_PATH } from '@/config/config';
import { useScheduleStore } from '@/stores/scheduleStore';

import RadioShowSection from './RadioShowSection.vue';

export default defineComponent({
  components: {
    RadioShowSection
  },
  props: {
    show: {
      type: Object as PropType<Program>,
      required: true
    }
  },
  computed: {
    ...mapState(useScheduleStore, ['cursorTime']),
    scheduleDisplay(): string {
      const start = DateTime.fromISO(this.show.start_at)
        .setZone(TIMEZONE).toLocaleString(DateTime.TIME_SIMPLE);
      const end = DateTime.fromISO(this.show.end_at)
        .setZone(TIMEZONE).toLocaleString(DateTime.TIME_SIMPLE);

      return `${start}-${end}`;
    },
    sectionsSorted(): Array<Section> {
      if (!this.show.sections) {
        return [];
      }

      // concat prevents "in place" sorting
      return this.show.sections.concat().sort((a, b) => {
        return a.start_at.localeCompare(b.start_at);
      });
    },
    isCurrent(): boolean {
      return Interval.fromDateTimes(DateTime.fromISO(this.show.start_at).setZone(TIMEZONE),
        DateTime.fromISO(this.show.end_at).setZone(TIMEZONE)).contains(this.cursorTime);
    },
    picture(): string {
      // @ts-expect-error defined on global scope
      // eslint-disable-next-line no-undef
      return `${cdnBaseUrl}${THUMBNAIL_PAGE_PROGRAM_PATH}${this.show.picture_url}`;
    }
  }
});
</script>
