<template>
  <div class="d-flex mb-2 align-items-stretch">
    <div v-if="section.picture_url" v-once class="flex-shrink-0">
      <img alt="" class="img-fluid" style="max-width: 48px; max-height: 48px"
        :src="'/media/cache/page_thumb/media/program/' + section.picture_url">
    </div>
    <div class="flex-fill ps-3 mb-3">
      <h6 v-once class="mt-0">{{ timeStart }} - {{ section.title }}</h6>
      <div v-if="section.presenter" v-once><i>{{ section.presenter }}</i></div>
      <div v-if="section.description" v-once class="mt-1">{{ section.description }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { DateTime } from 'luxon';

import { TIMEZONE } from '@/config/config';

import type { Section } from '@/types/section';

export default defineComponent({
  props: {
    section: {
      type: Object as PropType<Section>,
      required: true
    }
  },
  computed: {
    timeStart(): string {
      return DateTime.fromISO(this.section.start_at)
        .setZone(TIMEZONE).toLocaleString(DateTime.TIME_SIMPLE);
    }
  }
});
</script>
