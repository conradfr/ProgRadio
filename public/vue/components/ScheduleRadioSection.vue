<template>
  <div class="program-section" :style="styleObject" :id="section.hash"
    v-on:mouseover.stop="hoverOn()" v-on:mouseleave="hoverOff()" v-once>
  </div>
</template>

<script>
import { TIMEZONE, MINUTE_PIXEL } from '../config/config';

const moment = require('moment');

export default {
  props: ['program_start', 'section'],
  data() {
    const left = moment(this.section.start_at).diff(this.program_start, 'minutes') * MINUTE_PIXEL;

    return {
      styleObject: {
        left: `${left}px`
      }
    };
  },
  methods: {
    hoverOn() {
      // @todo improve / refactor

      function popoverTitle(title, startAt) {
        const format = 'HH[h]mm';
        const start = moment(startAt).tz(TIMEZONE).format(format);

        return `${title} - ${start}`;
      }

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

      /* eslint-disable no-undef */
      $(`#${this.section.hash}`).popover({
        content: popoverContent(this.section.presenter, this.section.description),
        title: popoverTitle(this.section.title, this.section.start_at),
        container: 'body',
        html: true
      }).popover('show');
    },
    hoverOff() {
      /* eslint-disable no-undef */
      $(`#${this.section.hash}`).popover('destroy');
    }
  }
};
</script>
