<template>
  <div class="timeline-cursor" :style="styleObject"></div>
</template>

<script>
import { TICK_INTERVAL } from '../config/config';

export default {
  computed: {
    styleObject() {
      return { left: this.$store.getters.cursorIndex };
    }
  },
  methods: {
    tick() {
      this.$store.dispatch('tick');
    }
  },
  mounted() {
    setInterval(this.tick, TICK_INTERVAL);
  }
};
</script>
