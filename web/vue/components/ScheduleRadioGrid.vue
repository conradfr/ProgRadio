<template>
    <div class="schedule-radio-grid" id="schedule-radio-grid" :style="styleObject">
        <timeline-cursor></timeline-cursor>
        <v-touch v-on:swipe="onSwipe"
                 v-on:panleft="onPan" v-on:panright="onPan" v-on:panstart="onPanStart" v-on:panend="onPanEnd">
            <schedule-radio-grid-row v-for="entry in radios" :key="entry.code_name" :radio="entry.code_name"></schedule-radio-grid-row>
        </v-touch>
    </div>
</template>

<script>
import Vue from 'vue';
import { mapGetters } from 'vuex'

const VueTouch = require('vue-touch');
Vue.use(VueTouch, {name: 'v-touch'});

import { NAV_MOVE_BY } from '../config/config.js';
import TimelineCursor from './TimelineCursor.vue'
import ScheduleRadioGridRow from './ScheduleRadioGridRow.vue'

export default {
    components: { TimelineCursor, ScheduleRadioGridRow },
    data: function () {
        return {
            mousedown: false,
            clickX: null,
            swipeActive: false
        }
    },
    computed: {
        styleObject: function() {
            const styleObject = {
                left: this.$store.getters.gridIndex.left
            };

            // disable grid transition while manually scrolling, avoid lag effect
            if (this.$store.state.scrollClick) { styleObject.transition = 'none'; }

            return styleObject;
        },
        ...mapGetters({
            radios: 'radiosRanked'
        })
    },
    /* @note scroll inspired by https://codepen.io/pouretrebelle/pen/cxLDh */
    methods: {
        onSwipe: function (event) {
            this.swipeActive = true;
            setInterval(this.swipeEnd, 1000);

            // avoid ghost click
//            if (this.clickX !== null /* || ([2,4].indexOf(event.direction) === -1)*/) { return; }

            const amount = (NAV_MOVE_BY / 2.2) * event.velocityX * -1;
            this.$store.dispatch('scroll', amount);
        },
        swipeEnd: function () {
            this.swipeActive = false;
        },
        onPanStart: function () {
            if (this.swipeActive === true) { return; }

            this.$store.dispatch('scrollClick', true);
            this.clickX = 0;
        },
        onPanEnd: function () {
            if (this.swipeActive === true) { return; }

            this.$store.dispatch('scrollClick', false);
        },
        onPan: function (event) {
            if (this.swipeActive === true) { return; }

            this.$store.dispatch('scroll', (-1 * (event.deltaX - (this.clickX + event.overallVelocityX))));
            this.clickX = event.deltaX;
        }
    }
}
</script>
