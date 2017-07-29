<template>
    <div class="schedule-radio-grid" id="schedule-radio-grid" v-on:mousedown="dragClick" v-on:mousemove="dragMove" v-on:mouseup="dragOff" :style="styleObject">
        <timeline-cursor></timeline-cursor>
        <schedule-radio-grid-row v-for="entry in radios" :key="entry.code_name" :radio="entry.code_name"></schedule-radio-grid-row>
    </div>
</template>

<script>
import { mapState } from 'vuex'

import TimelineCursor from './TimelineCursor.vue'
import ScheduleRadioGridRow from './ScheduleRadioGridRow.vue'

export default {
    components: { TimelineCursor, ScheduleRadioGridRow },
    data: function () {
        return {
            mousedown: false,
            clickX: null
        }
    },
    computed: mapState({
        radios: state => state.radios,
        styleObject: function() {
            const styleObject = {
                left: this.$store.getters.gridIndex.left
            };

            if (this.mousedown === true) { styleObject.transition = 'none'; }

            return styleObject;
        }
    }),
    /* @note scroll inspired by https://codepen.io/pouretrebelle/pen/cxLDh */
    methods: {
        dragClick: function (event) {
            this.clickX = event.pageX;
            this.mousedown = true;
        },
        dragOff: function (event) {
            this.mousedown = false;
        },
        dragMove: function (event) {
            if (this.mousedown === false) { return; }

            this.$store.dispatch('scroll', (this.clickX - event.pageX));
            this.clickX = event.pageX;
        }
    }
}
</script>
