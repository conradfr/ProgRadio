<template>
  <div class="d-flex mb-2 align-items-stretch">
    <div v-if="section.picture_url" class="flex-shrink-0">
      <img alt="" class="img-fluid" style="max-width: 48px; max-height: 48px"
        :src="'/media/cache/page_thumb/media/program/' + section.picture_url">
    </div>
    <div class="flex-fill ps-3 mb-3">
      <h6 class="mt-0">{{ section.start_at | time }} - {{ section.title }}</h6>
      <div v-if="section.presenter">{{ section.presenter }}</div>
    </div>
  </div>
</template>

<script>
import { DateTime } from 'luxon';
import { TIMEZONE } from '../../config/config';

export default {
  props: ['section'],
  filters: {
    time(value) {
      return DateTime.fromISO(value)
        .setZone(TIMEZONE).toLocaleString(DateTime.TIME_SIMPLE);
    }
  }
};
</script>
