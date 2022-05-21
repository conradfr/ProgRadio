<template>
  <div class="program-section" :style="styleObject" :id="`s-${section.hash}`"
    v-on:mouseover.stop="hoverOn()" v-on:mouseleave="hoverOff()" v-once>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { DateTime } from 'luxon';

import type { Section } from '@/types/section';

import { TIMEZONE, MINUTE_PIXEL } from '@/config/config';

export default defineComponent({
  props: {
    program_start: {
      type: String,
      required: true
    },
    section: {
      type: Object as PropType<Section>,
      required: true
    }
  },
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

      function popoverTitle(title: string, startAt: string) {
        const start = DateTime.fromISO(startAt)
          .setZone(TIMEZONE).toLocaleString(DateTime.TIME_SIMPLE);

        return `${title} - ${start}`;
      }

      function popoverContent(presenter?: string|null, description?: string|null) {
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
      // @ts-expect-error bootstrap is defined on global scope
      this.popover = new bootstrap.Popover(document.getElementById(`s-${this.section.hash}`), {
        content: popoverContent(this.section.presenter, this.section.description),
        title: popoverTitle(this.section.title, this.section.start_at),
        container: 'body',
        trigger: 'focus',
        html: true
      });

      // @ts-ignore
      this.popover!.show();
    },
    hoverOff() {
      if (this.popover !== undefined && this.popover !== null) {
        // @ts-ignore
        this.popover.dispose();
        this.popover = null;
      }
    }
  }
});
</script>
