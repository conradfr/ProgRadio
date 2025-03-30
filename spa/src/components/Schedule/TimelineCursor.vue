<template>
  <div class="timeline-cursor"
    :class="{ 'timeline-cursor-today': isToday }"
    :style="styleObject">
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapActions } from 'pinia';

import { useScheduleStore } from '@/stores/scheduleStore';

import { TICK_INTERVAL } from '@/config/config';

export default defineComponent({
  data(): {
    tickInterval: number|null
  } {
    return {
      tickInterval: null
    };
  },
  mounted() {
    this.setTick();
  },
  watch: {
    // if browsing another day we freeze the cursor
    isToday(newValue) {
      if (newValue === true) {
        this.setTick();
        return;
      }

      if (this.tickInterval !== null) {
        clearInterval(this.tickInterval);
      }
    }
  },
  computed: {
    ...mapState(useScheduleStore, ['isToday', 'cursorIndex']),
    styleObject(): object {
      return { left: this.cursorIndex };
    }
  },
  methods: {
    ...mapActions(useScheduleStore, ['tick']),
    setTick() {
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      this.tickInterval = setInterval(this.tick, TICK_INTERVAL);
    }
  }
});
</script>
