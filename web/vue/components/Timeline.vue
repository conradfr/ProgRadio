<template>
    <div class="timeline" :style="styleObject">
        <div class="timeline-control timeline-control-left"  v-on:click="clickBackward"><span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span></div>
        <div class="timeline-control timeline-control-right" v-on:click="clickForward"><span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span></div>
        <div v-for="hour in 24" class="time">
            {{ hour | toTime }}
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'

import { NAV_MOVE_BY } from '../config/config.js';

export default {
    filters: {
        toTime: function (value) {
            return `${("0" + (value - 1)).slice(-2)}h00`
        }
    },
    computed: mapState({
        styleObject: function() { return this.$store.getters.gridIndex; }
    }),
    methods: {
        clickBackward: function () {
            this.$store.dispatch('scroll', (-1 * NAV_MOVE_BY));
        },
        clickForward: function () {
            this.$store.dispatch('scroll', NAV_MOVE_BY);
        }
    }
}
</script>
