<template>
  <div v-if="liveSongTitle"
    class="player-song-xl flex-grow-1 d-flex justify-content-start align-items-center cursor-pointer"
    @click="gotoRadio">
    <div v-if="liveSongCover" class="player-logo-xl me-3">
      <img :src="liveSongCover" />
    </div>
    <div><span class="note-title">♫</span>&nbsp;{{ liveSongTitle }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { mapState, mapActions } from 'pinia';

import type { Stream } from '@/types/stream';

import ITunesApi from '@/api/ITunesApi';

import { usePlayerStore } from '@/stores/playerStore';

export default defineComponent({
  props: {
    stream: {
      type: Object as PropType<Stream>,
      required: true
    },
  },
  data(): {
    lastStreamId: string|null,
    iTunesCover: string|null,
  } {
    return {
      lastStreamId: null,
      iTunesCover: null
    }
  },
  beforeMount() {
    this.joinChannel();
    document.addEventListener('visibilitychange', this.visibilityChanged);
  },
  beforeUnmount() {
    this.leaveChannel();
    document.removeEventListener('visibilitychange', this.visibilityChanged);
  },
  watch: {
    stream(_newValue, oldValue) {
      if (oldValue && this.lastStreamId) {
        this.leaveChannel(this.lastStreamId);
      }

      this.joinChannel();
    },
    // when the song has no cover we try to get one from iTunes
    liveSongTitle: {
      immediate: true,
      handler() {
        this.iTunesCover = null;
        this.fetchITunesCover();
      }
    },
  },
  computed: {
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
    joinChannel() {
      setTimeout(() => {
        if (this.stream.id) {
          this.joinSongChannel(this.stream.id);
          this.lastStreamId = this.stream.id;
        }
      }, 500);
    },
    leaveChannel(lastStreamId = null) {
      setTimeout(() => {
        if (lastStreamId || this.lastStreamId) {
          this.leaveSongChannel(lastStreamId || this.stream.id || this.lastStreamId);
          this.lastStreamId = null;
        }
      }, lastStreamId ? 5 : 1000);
    },
    gotoRadio() {
      if (!this.stream) {
        return;
      }

      console.log(this.stream);

      // @ts-expect-error defined on global scope
      // eslint-disable-next-line no-undef
      if (this.stream.radio_code_name && isProgRadio) {
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
