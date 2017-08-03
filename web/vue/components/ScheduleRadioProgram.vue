<template>
    <div class="program-container" :style="styleObject" v-on:mouseup="detailClick">
<!--        <div class="program program-full" :style="styleObjectDetail">
            <div class="program-inner">
                <div class="program-title">{{ program.title }}</div>
                <div class="program-host">{{ program.host  }}</div>
                <div class="program-description">{{ program.description }}</div>
            </div>
        </div> -->

        <div class="program">
            <div class="program-inner">
                <div class="program-title"><span class="schedule-display">{{ scheduleDisplay}}</span>{{ program.title }}</div>
                <div class="program-host">{{ program.host  }}</div>
                <div class="program-description-short"><div class="program-description-short-inner">{{ program.description | shorten(program.duration) }}</div></div>
            </div>
        </div>
    </div>
</template>

<script>
const moment = require('moment');

import { MINUTE_PIXEL } from '../config/config.js';

export default {
    props: ['program'],
    data: function () {
        // Style
        const width = `${this.program.duration * MINUTE_PIXEL}px`;
        const startDay = moment(this.program.start_at).startOf('day');
        const left = moment(this.program.start_at).diff(startDay, 'minutes') * MINUTE_PIXEL;

        return {
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
        styleObjectDetail: function() {
            if (this.displayDetail === false) { return {}; }

            return {
                visibility: 'visible'
            };
        },
        scheduleDisplay: function() {
            const format = 'HH[h]mm';
            const start = moment(this.program.start_at).format(format);
            const end = moment(this.program.end_at).format(format);

            return `${start}-${end}`;
        }
    },
    methods: {
        detailClick: function (event) {
            // this.displayDetail = !this.displayDetail;
        },
    },
    filters: {
        shorten: function (value, duration) {
            if (value === null) { return ''; }
            if (duration < 15) { return ''; }

            const firstLine = value.split('\n')[0];

            return firstLine;

/*            let shortString = firstLine;

            if (firstLine.length > duration) {
                const shorten = firstLine.substr(0, duration);
                shortString = `${shorten} (...)`;
            }

            return shortString;*/
        }
    },
}
</script>
