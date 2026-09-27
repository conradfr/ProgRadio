<template>
  <div v-if="liveSongHistory && liveSongHistory.length > 0" class="mb-4">
    <div class="mt-3 mb-3 d-flex align-items-center cursor-pointer" @click="showHistory = !showHistory">
      <h6 class="me-2 mb-0">{{ $t('message.streaming.history') }}</h6>
      <i class="bi" :class="{ 'bi-caret-right-fill': !showHistory, 'bi-caret-down-fill': showHistory }"></i>
    </div>
    <Transition name="stream-list">
    <div v-if="showHistory" class="mt-3">
      <div v-for="entry in liveSongHistory" :key="entry" class="d-flex mb-3">
        <div class="me-3 history-song-cover">
          <img :src="entry[1]">
        </div>
        <div class="d-flex flex-column justify-content-center">
          <div class="mb-1">
            <span v-if="entry[2]" class="text-muted">{{ entry[2] }}&nbsp;-</span>
            {{ entry[0] }}
          </div>
          <song-links :title="entry[0]" />
        </div>
      </div>
    </div>
    </Transition>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { mapState } from 'pinia';
import { DateTime } from 'luxon';

import type { Stream } from '@/types/stream.ts';

import { THUMBNAIL_STREAM_PLACEHOLDER } from '@/config/config';

import { usePlayerStore } from '@/stores/playerStore.ts';

import PlayerUtils from '@/utils/PlayerUtils.ts';
import SongLinks from '../Utils/SongLinks.vue';

export default defineComponent({
  components: {
    SongLinks
  },
  props: {
    stream: {
      type: Object as PropType<Stream>,
      required: true
    },
  },
  data(): {
    showHistory: boolean,
  } {
    return {
      showHistory: false,
    };
  },
  computed: {
    ...mapState(usePlayerStore, ['songHistory']),
    liveSongHistory() {
      if (!this.songHistory || !Object.prototype.hasOwnProperty.call(this.songHistory, this.stream.id)) {
        return null;
      }

      return this.songHistory[this.stream.id].history.map((entry: any) => {
        const detectedAt = entry.detected_at ? DateTime.fromISO(entry.detected_at).toLocal() : null;
        const detectedAtTime = detectedAt?.isValid ? detectedAt.toFormat('HH:mm') : null;
        const cover = entry.cover_url || `${this.$CDN_BASE_URL}${THUMBNAIL_STREAM_PLACEHOLDER}`;

        return [PlayerUtils.formatSong(entry), cover, detectedAtTime]
      });
    },
  }
});
</script>
