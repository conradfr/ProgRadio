<template>
  <div class="media">
    <div v-if="section.picture_url" class="media-left">
      <img alt="" class="media-object" style="width: 48px"
        :src="'/media/cache/page_thumb/media/program/' + section.picture_url">
    </div>
    <div class="media-body">
      <h6 class="media-heading show-title">{{ section.start_at | time }} - {{ section.title }}</h6>
      <div v-if="section.presenter" class="show-host">{{ section.presenter }}</div>
    </div>
  </div>
</template>

<script>
import { DateTime } from 'luxon';
import { TIMEZONE } from '../config/config';

export default {
  props: ['section'],
  filters: {
    time(value) {
      return DateTime.fromSQL(value)
        .setZone(TIMEZONE).toLocaleString(DateTime.TIME_SIMPLE);
    }
  }
};
</script>
