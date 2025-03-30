<template>
  <div class="schedule-radio-grid-no-radio alert alert-warning text-center"
     role="alert" :style="noRadioStyleObject">
    {{ $t(textKey) }}
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'pinia';

import { useScheduleStore } from '@/stores/scheduleStore';

import { COLLECTION_FAVORITES } from '@/config/config';

export default defineComponent({
  props: {
    collection: {
      type: String,
      required: true
    },
  },
  computed: {
    ...mapState(useScheduleStore, ['scrollIndex']),
    textKey() {
      if (this.collection === COLLECTION_FAVORITES) {
        return 'message.schedule.no_radio_favorites';
      }

      return 'message.schedule.no_radio';
    },
    noRadioStyleObject() {
      const newLeft = this.scrollIndex + (window.innerWidth / 2) - 200;
      return {
        left: `${newLeft}px`,
      };
    }
  },
});
</script>
