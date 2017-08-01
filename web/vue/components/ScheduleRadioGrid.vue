<template>
    <div class="schedule-radio-grid" id="schedule-radio-grid" :style="styleObject"
         v-on:mousedown="dragClick" v-on:mousemove="dragMove" v-on:mouseup="dragOff">
        <timeline-cursor></timeline-cursor>
        <v-touch v-on:swipe="onSwipe">
            <schedule-radio-grid-row v-for="entry in radios" :key="entry.code_name" :radio="entry.code_name"></schedule-radio-grid-row>
        </v-touch>
    </div>
</template>

<script>
import Vue from 'vue';
import { mapGetters } from 'vuex'

const VueTouch = require('vue-touch');
Vue.use(VueTouch, {name: 'v-touch'});

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
    computed: {
        styleObject: function() {
            const styleObject = {
                left: this.$store.getters.gridIndex.left
            };

            // disable grid transition while manually scrolling, avoid lag effect
            if (this.mousedown === true) { styleObject.transition = 'none'; }
            return styleObject;
        },
        ...mapGetters({
            radios: 'radiosRanked'
        })
    },
    /* @note scroll inspired by https://codepen.io/pouretrebelle/pen/cxLDh */
    methods: {
        dragClick: function (event) {
            this.clickX = event.pageX;
            this.mousedown = true;
        },
        dragOff: function () {
            this.mousedown = false;
        },
        dragMove: function (event) {
            if (this.mousedown === false) { return; }

            this.$store.dispatch('scroll', (this.clickX - event.pageX));
            this.clickX = event.pageX;
        },
        onSwipe: function (event) {
            // avoid ghost click
            if (this.clickX !== null) { return; }

            this.$store.dispatch('scroll', -event.deltaX);
        }
    }
}
</script>
