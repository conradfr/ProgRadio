<template>
  <div v-if="liveSongTitle" class="d-flex mt-4 mb-4">
    <div v-if="liveSongCover" class="me-3 live-song-cover">
      <img :src="liveSongCover">
    </div>
    <div class="d-flex flex-column justify-content-center flex-grow-1">
      <div class="mb-3 d-flex">
        <strong>{{ $t('message.streaming.playing') }}:</strong>&nbsp;&nbsp;♫ {{ liveSongTitle }}&nbsp;&nbsp;
        <player-save-song v-if="userLogged" />
      </div>
      <song-links :title="liveSongTitle" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { mapState, mapActions } from 'pinia';

import type { Stream } from '@/types/stream.ts';

import { usePlayerStore } from '@/stores/playerStore.ts';
import { useUserStore } from '@/stores/userStore.ts';

import PlayerUtils from '@/utils/PlayerUtils';

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
  mounted() {
    setTimeout(() => {
      if (this.stream && this.channelName) {
        this.joinSongChannel(this.channelName);
      }
    }, 150);
  },
  beforeUnmount() {
    setTimeout(() => {
      if (this.stream && this.channelName) {
        this.leaveSongChannel(this.channelName);
      }
    }, 1000);
  },
  computed: {
    ...mapState(useUserStore, { userLogged: 'logged' }),
    ...mapState(usePlayerStore, ['liveSong']),
    channelName() {
      return PlayerUtils.getChannelName(this.stream);
    },
    liveSongData() {
      return this.liveSong(this.stream);
    },
    liveSongTitle() {
      return this.liveSongData && this.liveSongData[0] ? this.liveSongData[0] : null;
    },
    liveSongCover() {
      return this.liveSongData && this.liveSongData[1] ? this.liveSongData[1] : null;
    },
  },
  methods: {
    ...mapActions(usePlayerStore, [
      'joinSongChannel',
      'leaveSongChannel',
    ]),
  }
});
</script>
