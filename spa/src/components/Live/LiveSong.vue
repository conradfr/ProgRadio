<template>
  <div v-if="liveSongTitle" class="d-flex mt-4 mb-4">
    <div v-if="liveSongCover" class="me-3 live-song-cover">
      <img :src="liveSongCover">
    </div>
    <div class="d-flex flex-column justify-content-center flex-grow-1">
      <div class="mb-3 d-flex">
        <strong>{{ $t('message.streaming.playing') }}:</strong>&nbsp;&nbsp;<span class="note-title">♫</span>&nbsp;{{ liveSongTitle }}&nbsp;&nbsp;
        <PlayerSaveSong v-if="userLogged" :stream="stream" />
      </div>
      <SongLinks :title="liveSongTitle" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { mapState, mapActions } from 'pinia';

import type { Stream } from '@/types/stream.ts';

import ITunesApi from '@/api/ITunesApi';

import { usePlayerStore } from '@/stores/playerStore.ts';
import { useUserStore } from '@/stores/userStore.ts';

import PlayerSaveSong from '../Player/Common/PlayerSaveSong.vue';
import SongLinks from '../Utils/SongLinks.vue';

export default defineComponent({
  components: {
    PlayerSaveSong,
    SongLinks
  },
  props: {
    stream: {
      type: Object as PropType<Stream>,
      required: true
    }
  },
  data(): {
    iTunesCover: string|null,
  } {
    return {
      iTunesCover: null
    }
  },
  watch: {
    // when the song has no cover we try to get one from iTunes
    liveSongTitle: {
      immediate: true,
      handler() {
        this.iTunesCover = null;
        this.fetchITunesCover();
      }
    },
  },
  mounted() {
    document.addEventListener('visibilitychange', this.visibilityChanged);

    setTimeout(() => {
      if (this.stream) {
        this.joinSongChannel(this.stream.id);
      }
    }, 150);
  },
  beforeUnmount() {
    document.removeEventListener('visibilitychange', this.visibilityChanged);

    setTimeout(() => {
      if (this.stream) {
        this.leaveSongChannel(this.stream.id);
      }
    }, 1000);
  },
  computed: {
    ...mapState(useUserStore, { userLogged: 'logged' }),
    ...mapState(usePlayerStore, ['liveSong']),
    liveSongData() {
      return this.liveSong(this.stream);
    },
    liveSongTitle() {
      return this.liveSongData && this.liveSongData[0] ? this.liveSongData[0] : null;
    },
    liveSongCover() {
      return this.liveSongData && this.liveSongData[1] ? this.liveSongData[1] : this.iTunesCover;
    },
  },
  methods: {
    ...mapActions(usePlayerStore, [
      'joinSongChannel',
      'leaveSongChannel',
    ]),
    async fetchITunesCover() {
      const title = this.liveSongTitle;

      // not when the tab is in the background, the cover is fetched when it is visible again
      if (document.hidden || !title || (this.liveSongData && this.liveSongData[1])) {
        return;
      }

      try {
        const cover = await ITunesApi.getCoverUrl(title);

        // the song may have changed while we were waiting
        if (this.liveSongTitle === title) {
          this.iTunesCover = cover;
        }
      } catch (_e) {
        // no cover
      }
    },
    visibilityChanged() {
      if (!document.hidden && !this.liveSongCover) {
        this.fetchITunesCover();
      }
    },
  }
});
</script>
