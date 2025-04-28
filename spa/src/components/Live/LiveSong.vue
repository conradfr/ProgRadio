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

import type { Radio } from '@/types/radio.ts';
import type { Stream } from '@/types/stream.ts';

import { usePlayerStore } from '@/stores/playerStore.ts';
import { useUserStore } from '@/stores/userStore.ts';

import typeUtils from '@/utils/typeUtils.ts';
import PlayerUtils from '@/utils/PlayerUtils.ts';

import PlayerSaveSong from '../Player/Common/PlayerSaveSong.vue';
import SongLinks from '../Utils/SongLinks.vue';


export default defineComponent({
  components: {
    PlayerSaveSong,
    SongLinks
  },
  props: {
    stream: {
      type: Object as PropType<Radio|Stream>,
      required: true
    }
  },
  data(): {
    channelName: null|string
  } {
    return {
      channelName: null,
    };
  },
  mounted() {
    setTimeout(() => {
      if (this.stream) {
        this.channelName = PlayerUtils.getChannelName(
            this.stream,
            this.stream.radio_stream_code_name
        ) || '';

        if (this.channelName && this.channelName !== '') {
          this.joinChannel(this.channelName);
        }
      }
    }, 150);
  },
  beforeUnmount() {
    setTimeout(() => {
      if (this.channelName) {
        this.leaveChannel(this.channelName);
      }
    }, 1000);
  },
  computed: {
    ...mapState(useUserStore, { userLogged: 'logged' }),
    ...mapState(usePlayerStore, ['liveSong']),
    liveSongTitle() {
      if (typeUtils.isRadio(this.stream)) {
        const liveSongData = this.liveSong(this.stream, `${this.stream.code_name}_main`);
        return liveSongData && liveSongData[0] ? liveSongData[0] : null;
      }

      const liveSongData = this.liveSong(this.stream, this.stream.radio_stream_code_name);
      return liveSongData && liveSongData[0] ? liveSongData[0] : null;
    },
    liveSongCover() {
      if (typeUtils.isRadio(this.stream)) {
        const liveSongData = this.liveSong(this.stream, `${this.stream.code_name}_main`);
        return liveSongData && liveSongData[1] ? liveSongData[1] : null;
      }

      const liveSongData = this.liveSong(this.stream, this.stream.radio_stream_code_name);
      return liveSongData && liveSongData[1] ? liveSongData[1] : null;
    },
    amazonLink() {
      if (!this.liveSongTitle || this.liveSongTitle === '') {
        return null;
      }

      return PlayerUtils.getAmazonSongLink(this.liveSongTitle);
    }
  },
  methods: {
    ...mapActions(usePlayerStore, [
      'joinChannel',
      'leaveChannel',
    ]),
  }
});
</script>
