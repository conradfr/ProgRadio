<template>
    <div class="timeline-cursor-head" :style="styleObject"></div>
</template>

<script>
import { GRID_VIEW_EXTRA_LEFT } from '../config/config.js';

export default {
    computed: {
        styleObject: function() {
            const style = {
                left: `calc(${this.$store.getters.cursorIndex} + ${this.$store.getters.gridIndex.left} + ${GRID_VIEW_EXTRA_LEFT}px)`
            };

            if (this.$store.state.schedule.scrollClick === true) { style.transition = 'none'; }

            return style;
        }
    }
}
</script>
