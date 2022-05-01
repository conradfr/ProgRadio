<template>
  <div class="timeline-cursor"
       v-bind:class="{ 'timeline-cursor-today': isToday }"
       :style="styleObject"></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapActions } from 'pinia';

/* eslint-disable import/no-cycle */
import { useScheduleStore } from '@/stores/scheduleStore';

import { TICK_INTERVAL } from '@/config/config';

export default defineComponent({
  /* eslint-disable indent */
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
  computed: {
    ...mapState(useScheduleStore, ['isToday', 'cursorIndex']),
    styleObject(): object {
      return { left: this.cursorIndex };
    }
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
  methods: {
    ...mapActions(useScheduleStore, ['tick']),
    setTick() {
      // @ts-ignore
      this.tickInterval = setInterval(this.tick(), TICK_INTERVAL);
    }
  }
});
</script>
