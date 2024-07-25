<template>
  <div class="player-infos" :title="showTitle" v-on:click="gotoRadio">
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

import typeUtils from '@/utils/typeUtils';

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
      if (!this.radio) {
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
      if (!this.show) {
        return '';
      }

      const start = DateTime.fromISO(this.show.start_at)
        .setZone(TIMEZONE).toLocaleString(DateTime.TIME_SIMPLE);
      const end = DateTime.fromISO(this.show.end_at)
        .setZone(TIMEZONE).toLocaleString(DateTime.TIME_SIMPLE);

      return `${this.show.title} - ${start}-${end}`;
    },
  },
  methods: {
    gotoRadio() {
      if (!this.radio) {
        return;
      }

      if (typeUtils.isRadio(this.radio)) {
        this.$router.push({
          name: 'radio',
          params: { radio: this.radio.code_name }
        });
      } else {
        this.$router.push({
          name: 'streaming',
          params: { countryOrCategoryOrUuid: this.radio.code_name, page: null }
        });
      }
    }
  }
});
</script>
