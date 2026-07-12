<template>
  <div class="player-infos" :class="className" :title="showTitle" @click="gotoRadio">
    <ul :style="infosUlStyle">
      <li>{{ radioName }}</li>
      <li v-if="show">{{ show.title }}</li>
      <li v-if="currentSongTitle">{{ currentSongTitle }}</li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'pinia';
import type { PropType } from 'vue';
import { DateTime } from 'luxon';

import type { Stream } from '@/types/stream';
import type { Radio } from '@/types/radio';
import type { Show } from '@/types/show';

import { TIMEZONE } from '@/config/config';

import { usePlayerStore } from '@/stores/playerStore.ts';

export default defineComponent({
  props: {
    className: {
      type: String,
      required: false,
      default: null
    },
    stream: {
      type: Object as PropType<Stream>,
      required: true
    },
    radio: {
      type: Object as PropType<Radio>,
      required: false
    },
    show: {
      type: Object as PropType<Show>,
      required: false
    },
  },
  computed: {
    ...mapState(usePlayerStore, ['currentSong']),
    infosUlStyle(): object {
      let animationCount = 1;

      if (this.show) {
        animationCount += 1;
      }

      if (this.currentSongTitle) {
        animationCount += 1;
      }

      return {
        // position: 'relative',
        // transform: `translateX(${left}px)`
        animationName: `roll-up-${animationCount}`
      };
    },
    radioName(): string {
      if (!this.stream) {
        return '';
      }

      return this.stream.name;
    },
    showTitle(): string {
      if (!this.show) {
        return '';
      }

      const start = DateTime.fromISO(this.show.start_at).setZone(TIMEZONE).toLocaleString(DateTime.TIME_SIMPLE);
      const end = DateTime.fromISO(this.show.end_at).setZone(TIMEZONE).toLocaleString(DateTime.TIME_SIMPLE);

      return `${this.show.title} - ${start}-${end}`;
    },
    currentSongTitle() {
      if (!this.currentSong || !this.currentSong[0]) {
        return null;
      }

      return this.currentSong[0];
    },
  },
  methods: {
    gotoRadio() {
      if (!this.stream) {
        return;
      }

      // @ts-expect-error defined on global scope
      // eslint-disable-next-line no-undef
      if (this.stream.radio_stream_code_name && isProgRadio) {
        this.$router.push({
          name: 'radio',
          params: { radio: this.stream.radio_code_name }
        });
      } else {
        this.$router.push({
          name: 'streaming',
          params: { countryOrCategoryOrUuid: this.stream.code_name, page: null }
        });
      }
    }
  }
});
</script>
