<template>
  <div class="d-flex align-items-stretch" v-bind:class="{ 'media-current': isCurrent }" v-once>
    <a v-if="isCurrent" class="anchor" id="media-current"></a>
    <div class="flex-shrink-0 media-timeline">
      .
    </div>
    <div v-if="show.picture_url" class="flex-shrink-0">
      <img alt="" class="img-fluid img-show mb-2"
         :src="picture" v-once>
    </div>
    <div class="flex-fill ps-3 mb-3">
      <h6 class="fw-bold mb-0">
        {{ scheduleDisplay }} - {{ show.title }}
      </h6>
      <div v-if="show.host" v-once>{{ show.host }}</div>
      <nl2br v-if="show.description" tag="p" :text="show.description"
         class-name="fw-light mt-2" v-once />

      <div v-if="show.sections && show.sections.length > 0" class="mt-1">
        <radio-show-section
            v-for="entry in show.sections" :key="entry.hash"
            :section="entry" v-once>
        </radio-show-section>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { DateTime, Interval } from 'luxon';
import Nl2br from 'vue3-nl2br';

import { TIMEZONE, THUMBNAIL_PAGE_PROGRAM_PATH } from '../../config/config';
import RadioShowSection from './RadioShowSection.vue';

export default {
  compatConfig: {
    MODE: 3
  },
  props: ['show'],
  components: {
    RadioShowSection,
    Nl2br
  },
  computed: {
    ...mapState({
      cursorTime: state => state.schedule.cursorTime,
    }),
    scheduleDisplay() {
      const start = DateTime.fromISO(this.show.start_at)
        .setZone(TIMEZONE).toLocaleString(DateTime.TIME_SIMPLE);
      const end = DateTime.fromISO(this.show.end_at)
        .setZone(TIMEZONE).toLocaleString(DateTime.TIME_SIMPLE);

      return `${start}-${end}`;
    },
    isCurrent() {
      return Interval.fromDateTimes(DateTime.fromISO(this.show.start_at).setZone(TIMEZONE),
        DateTime.fromISO(this.show.end_at).setZone(TIMEZONE)).contains(this.cursorTime);
    },
    picture() {
      return `${THUMBNAIL_PAGE_PROGRAM_PATH}${this.show.picture_url}`;
    }
  }
};
</script>
