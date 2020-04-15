<template>
  <div class="timeline-cursor"
       v-bind:class="{ 'timeline-cursor-today': isToday }"
       :style="styleObject"></div>
</template>

<script>
import { mapGetters } from 'vuex';
import { TICK_INTERVAL } from '../config/config';

export default {
  data() {
    return {
      tickInterval: null
    };
  },
  computed: {
    ...mapGetters([
      'isToday'
    ]),
    styleObject() {
      return { left: this.$store.getters.cursorIndex };
    }
  },
  watch: {
    // if browsing another day we freeze the cursor
    isToday(newValue) {
      if (newValue === true) {
        this.setTick();
      } else {
        clearInterval(this.tickInterval);
      }
    }
  },
  methods: {
    tick() {
      this.$store.dispatch('tick');
    },
    setTick() {
      this.tickInterval = setInterval(this.tick, TICK_INTERVAL);
    }
  },
  mounted() {
    this.setTick();
  }
};
</script>
