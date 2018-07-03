<template>
    <div class="program-section" :style="styleObject" :id="section.hash"
         v-on:mouseover.stop="hoverOn()" v-on:mouseleave="hoverOff()">
    </div>
</template>

<script>
const moment = require('moment');

import { MINUTE_PIXEL} from '../config/config.js';

export default {
    props: ['program_start', 'section'],
    data: function () {
        const startProgram = moment(this.program_start);
        const left = moment(this.section.start_at).diff(startProgram, 'minutes') * MINUTE_PIXEL;

        return {
            styleObject: {
                left: `${left}px`
            }
        }
    },
    methods: {
        hoverOn: function (event) {
            // @todo improve
            function popoverContent(presenter, description) {
                let content = '';
                if (presenter !== undefined && presenter !== null) {
                    content += `<p class="section-presenter">${presenter}</p>`;
                }
                if (description !== undefined && description !== null) {
                    content += `<p class="section-description">${description}</p>`;
                }
                return content;
            }

            $(`#${this.section.hash}`).popover({
                content: popoverContent(this.section.presenter, this.section.description),
                title: this.section.title,
                container: 'body',
                html: true
            }).popover('show');
        },
        hoverOff: function (event) {
            $(`#${this.section.hash}`).popover('destroy');
        }
    }
}
</script>
