<template>
  <div class="timeline-cursor-head"
    :class="{ 'timeline-cursor-head-today': isToday }"
    :style="styleObject">
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'pinia';
import { GRID_VIEW_EXTRA_LEFT } from '@/config/config';

import { useScheduleStore } from '@/stores/scheduleStore';

export default defineComponent({
  computed: {
    ...mapState(useScheduleStore, ['isToday', 'cursorIndex', 'gridIndexLeft', 'scrollClick']),
    styleObject() {
      const style: any = {
        left: `calc(${this.cursorIndex}
                    + ${this.gridIndexLeft.left}
                    + ${GRID_VIEW_EXTRA_LEFT}px)`
      };

      if (this.scrollClick) {
        style.transition = 'none';
      }

      return style;
    }
  }
});
</script>
