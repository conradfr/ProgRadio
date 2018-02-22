<template>
    <div class="program-container" :style="styleObject" v-on:mouseup="detailClick">
<!--        <div class="program program-full" :style="styleObjectDetail">
            <div class="program-inner">
                <div class="program-title"><span class="schedule-display">{{ scheduleDisplay}}</span>{{ program.title }}</div>
                <div class="program-host">{{ program.host  }}</div>
                <div class="program-description">{{ program.description }}</div>
            </div>
        </div>-->

        <div class="program" v-bind:class="{ 'program-current': isCurrent, 'long-enough': isLongEnough }" v-on:mouseover.once="hover = !hover">
            <div class="program-inner">
                <div class="program-img" v-if="program.picture_url && (hover || isCurrent)">
                    <img v-bind:src="program.picture_url | picture" alt="">
                </div>
                <div class="program-title"><span class="schedule-display">{{ scheduleDisplay }}</span>{{ program.title }}</div>
                <div class="program-host">{{ program.host }}</div>
                <div class="program-description-short" v-bind:class="{ 'program-description-nohost': !program.host }"><div class="program-description-short-inner">{{ program.description | shorten(program.duration) }}</div></div>
            </div>
        </div>
    </div>
</template>

<script>
const moment = require('moment');

import { mapState } from 'vuex'
import { MINUTE_PIXEL, THUMBNAIL_PATH, PROGRAM_LONGENOUGH } from '../config/config.js';

export default {
    props: ['program'],
    data: function () {
        // Style
        const width = `${this.program.duration * MINUTE_PIXEL}px`;
        const startDay = moment(this.program.start_at).startOf('day');
        const left = moment(this.program.start_at).diff(startDay, 'minutes') * MINUTE_PIXEL;

        return {
            hover:false,
            displayDetail: false,
            divData: null,
            styleObject: {
                left: `${left}px`,
                width: width,
                minWidth: width,
                maxWidth: width
            }
        }
    },
    computed: {
        ...mapState({
            cursorTime: state => state.schedule.cursorTime
        }),
        styleObjectDetail: function() {
            if (this.displayDetail === false) { return {}; }

            const width = `${this.program.duration * MINUTE_PIXEL}px`;

            return {
                zIndex: 4,
                visibility: 'visible',
                minWidth: `${60 * MINUTE_PIXEL}px`,
                width: width,
                height: '150px'
            };
        },
        scheduleDisplay: function() {
            const format = 'HH[h]mm';
            const start = moment(this.program.start_at).format(format);
            const end = moment(this.program.end_at).format(format);

            return `${start}-${end}`;
        },
        isCurrent: function () {
            return this.cursorTime.isBetween(moment(this.program.start_at), moment(this.program.end_at));
        },
        isLongEnough: function () {
            return this.program.duration >= PROGRAM_LONGENOUGH;
        }
    },
    methods: {
        detailClick: function (event) {
//             this.displayDetail = !this.displayDetail;
        }
    },
    filters: {
        shorten: function (value, duration) {
            if (value === null) { return ''; }
            if (duration < 15) { return ''; }

            return value.split('\n')[0];
        },
        picture: (value) => {
            return `${THUMBNAIL_PATH}${value}`;
        }
    },
}
</script>
