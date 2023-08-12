<template>
  <div class="player-infos" :title="showTitle">
    <ul :style="infosUlStyle">
      <li>{{ radioName }}</li>
      <li v-if="show">{{ show.title }}</li>
      <li v-if="currentSong" >{{ currentSong }}</li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'pinia';

import { DateTime } from 'luxon';

import { TIMEZONE } from '@/config/config';

/* eslint-disable import/no-cycle */
import { usePlayerStore } from '@/stores/playerStore';

import typeUtils from '../../utils/typeUtils';

export default defineComponent({
  computed: {
    ...mapState(usePlayerStore, ['radio', 'radioStreamCodeName', 'show', 'currentSong']),
    infosUlStyle(): object {
      let animationCount = 1;

      if (this.show) {
        animationCount += 1;
      }

      if (this.currentSong) {
        animationCount += 1;
      }

      return {
        // position: 'relative',
        // transform: `translateX(${left}px)`
        animationName: `roll-up-${animationCount}`
      };
    },
    radioName(): string {
      if (this.radio === null) {
        return '';
      }

      if (typeUtils.isRadio(this.radio) && this.radioStreamCodeName !== null
        && Object.keys(this.radio.streams!).length > 0
          && Object.prototype.hasOwnProperty.call(this.radio.streams!, this.radioStreamCodeName)) {
        return this.radio.streams[this.radioStreamCodeName!].name;
      }

      return this.radio.name;
    },
    showTitle(): string {
      if (this.show === null) {
        return '';
      }

      const start = DateTime.fromISO(this.show.start_at)
        .setZone(TIMEZONE).toLocaleString(DateTime.TIME_SIMPLE);
      const end = DateTime.fromISO(this.show.end_at)
        .setZone(TIMEZONE).toLocaleString(DateTime.TIME_SIMPLE);

      return `${this.show.title} - ${start}-${end}`;
    },
  }
});
</script>
