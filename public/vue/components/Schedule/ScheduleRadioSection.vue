<template>
  <div class="program-section" :style="styleObject" :id="`s-${section.hash}`"
    v-on:mouseover.stop="hoverOn()" v-on:mouseleave="hoverOff()" v-once>
  </div>
</template>

<script>
import { DateTime } from 'luxon';

import { TIMEZONE, MINUTE_PIXEL } from '../../config/config';

export default {
  props: ['program_start', 'section'],
  data() {
    const left = DateTime.fromISO(this.section.start_at)
      .diff(DateTime.fromISO(this.program_start)).as('minutes') * MINUTE_PIXEL;

    return {
      popover: null,
      styleObject: {
        left: `${left}px`
      }
    };
  },
  methods: {
    hoverOn() {
      // @todo improve / refactor

      function popoverTitle(title, startAt) {
        const start = DateTime.fromISO(startAt)
          .setZone(TIMEZONE).toLocaleString(DateTime.TIME_SIMPLE);

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
      this.popover = new bootstrap.Popover(document.getElementById(`s-${this.section.hash}`), {
        content: popoverContent(this.section.presenter, this.section.description),
        title: popoverTitle(this.section.title, this.section.start_at),
        container: 'body',
        trigger: 'focus',
        html: true
      });

      this.popover.show();
    },
    hoverOff() {
      if (this.popover !== undefined && this.popover !== null) {
        this.popover.dispose();
        this.popover = null;
      }
    }
  }
};
</script>
