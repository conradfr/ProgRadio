<template>
    <div class="timeline-cursor" :style="styleObject"></div>
</template>

<script>
import { TICK_INTERVAL } from '../config/config.js';

export default {
    computed: {
        styleObject: function() {
            return {left: this.$store.getters.cursorIndex};
        }
    },
    methods: {
        tick: function () {
            this.$store.dispatch('tick');
        }
    },
    mounted: function() {
        setInterval(this.tick, TICK_INTERVAL);
    }
}
</script>
