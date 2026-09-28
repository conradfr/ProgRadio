<template>
  <div v-if="liveSongHistory && liveSongHistory.length > 0" class="mb-4">
    <div class="mt-3 mb-3 d-flex align-items-center">
      <h6 class="me-2 mb-0 collapsed cursor-pointer" data-bs-toggle="collapse" href="#historyDetails" aria-expanded="false">
        {{ $t('message.streaming.history') }}
        <i class="bi bi-caret-right-fill toggle-icon"></i>
      </h6>

    </div>
    <div class="collapse mt-3" id="historyDetails">
      <div v-for="entry in liveSongHistory" :key="entry" class="d-flex mb-3">
        <div class="me-3 history-song-cover">
          <img :src="entry[1]">
        </div>
        <div class="d-flex flex-column justify-content-center">
          <div class="mb-1">
            <span v-if="entry[2]" class="text-muted">{{ formatTime(entry[2]) }}&nbsp;-</span>
            {{ entry[0] }}
          </div>
          <song-links :title="entry[0]" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { mapState } from 'pinia';

import type { Stream } from '@/types/stream.ts';

import { THUMBNAIL_STREAM_PLACEHOLDER } from '@/config/config';

import formatDateTimeMixin from '@/mixins/formatDateTimeMixin'

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
  mixins: [formatDateTimeMixin],
  computed: {
    ...mapState(usePlayerStore, ['songHistory']),
    liveSongHistory() {
      if (!this.songHistory || !Object.prototype.hasOwnProperty.call(this.songHistory, this.stream.id)) {
        return null;
      }

      return this.songHistory[this.stream.id].history.map((entry: any) => {
        const cover = entry.cover_url || `${this.$CDN_BASE_URL}${THUMBNAIL_STREAM_PLACEHOLDER}`;
        return [PlayerUtils.formatSong(entry), cover, entry.detected_at];
      });
    },
  }
});
</script>
