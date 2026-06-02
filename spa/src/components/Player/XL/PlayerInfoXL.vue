<template>
  <div class="player-infos-xl d-flex flex-column cursor-pointer" :title="showTitle" @click="gotoRadio">
    <div class="player-infos-name">{{ streamName }}</div>
    <div v-if="show && show.title" class="player-infos-show-moto">{{ show.title }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'pinia';
import { DateTime } from 'luxon';

import { TIMEZONE } from '@/config/config';

import { usePlayerStore } from '@/stores/playerStore';

export default defineComponent({
  computed: {
    ...mapState(usePlayerStore, ['stream', 'radio', 'show']),
    streamName(): string {
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
