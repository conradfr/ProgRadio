<template>
  <div class="timeline-cursor-head"
       v-bind:class="{ 'timeline-cursor-head-today': isToday }"
       :style="styleObject"></div>
</template>

<script>
import { mapGetters } from 'vuex';
import { GRID_VIEW_EXTRA_LEFT } from '../../config/config';

export default {
  compatConfig: {
    MODE: 3
  },
  computed: {
    ...mapGetters([
      'isToday'
    ]),
    styleObject() {
      const style = {
        left: `calc(${this.$store.getters.cursorIndex}
                    + ${this.$store.getters.gridIndexLeft.left}
                    + ${GRID_VIEW_EXTRA_LEFT}px)`
      };

      if (this.$store.state.schedule.scrollClick === true) {
        style.transition = 'none';
      }

      return style;
    }
  }
};
</script>
