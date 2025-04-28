<template>
  <div v-if="liveSongHistory && liveSongHistory.length > 0" class="mb-4">
    <div class="mt-3 mb-3 d-flex align-items-center cursor-pointer" @click="show = !show">
      <h6 class="me-2 mb-0">{{ $t('message.streaming.history') }}</h6>
      <i class="bi" :class="{ 'bi-caret-right-fill': !show, 'bi-caret-down-fill': show }"></i>
    </div>
    <Transition name="stream-list">
    <div v-if="show" class="mt-3">
      <div v-for="entry in liveSongHistory" :key="entry" class="d-flex mb-3">
        <div v-if="entry[1]" class="me-3 history-song-cover">
          <img :src="entry[1]">
        </div>
        <div class="d-flex flex-column justify-content-center">
          <div class="mb-1">{{ entry[0] }}</div>
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

import type { Radio } from '@/types/radio.ts';
import type { Stream } from '@/types/stream.ts';

import { usePlayerStore } from '@/stores/playerStore.ts';

import PlayerUtils from '@/utils/PlayerUtils.ts';
import SongLinks from '../Utils/SongLinks.vue';

export default defineComponent({
  components: {
    SongLinks
  },
  props: {
    stream: {
      type: Object as PropType<Radio|Stream>,
      required: true
    },
    radioStreamCodeName: {
      type: String,
      required: false,
      default: null
    }
  },
  data(): {
    show: boolean,
  } {
    return {
      show: false,
    };
  },
  computed: {
    ...mapState(usePlayerStore, ['songHistory']),
    liveSongHistory() {
      const channelName = PlayerUtils.getChannelName(this.stream, this.radioStreamCodeName);

      if (!channelName || this.songHistory === null || this.songHistory === undefined
          || !Object.prototype.hasOwnProperty.call(this.songHistory, channelName)) {
        return null;
      }

      return this.songHistory[channelName].history.map((entry: any) => {
        return [PlayerUtils.formatSong(entry), entry.cover_url || null]
      });
    },
  }
});
</script>
