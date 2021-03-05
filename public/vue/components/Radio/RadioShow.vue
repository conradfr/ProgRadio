<template>
  <div class="media"
       v-bind:class="{ 'media-current': isCurrent }">
    <div v-if="show.picture_url" class="media-left">
      <img alt="" class="media-object" style="width: 64px"
         :src="picture">
    </div>
    <div class="media-body">
      <h6 class="media-heading show-title">
        {{ scheduleDisplay }} - {{ show.title }}
      </h6>
      <div v-if="show.host" class="show-host"> {{ show.host }}</div>
      <nl2br v-if="show.description" tag="p" :text="show.description"
        class-name="show-description" />
    </div>

    <div v-if="show.sections" class="sections">
      <radio-show-section
        v-for="entry in show.sections" :key="entry.hash"
        :section="entry">
      </radio-show-section>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { DateTime, Interval } from 'luxon';
import Nl2br from 'vue-nl2br';

import { TIMEZONE, THUMBNAIL_PAGE_PROGRAM_PATH } from '../../config/config';
import RadioShowSection from './RadioShowSection.vue';

export default {
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
