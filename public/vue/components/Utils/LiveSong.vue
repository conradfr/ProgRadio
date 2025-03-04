<template>
  <div class="d-flex  mt-4 mb-4" v-if="liveSongTitle">
    <div v-if="liveSongCover" class="me-3 live-song-cover">
      <img :src="liveSongCover">
    </div>
    <div class="d-flex flex-column flex-grow-1">
      <div class="mb-3 d-flex">
        <strong>{{ $t('message.streaming.playing') }}:</strong>&nbsp;&nbsp;♫ {{ liveSongTitle }}&nbsp;&nbsp;
        <player-save-song v-if="userLogged" />
      </div>
      <div>
        <a class="link-no-to-bold" target="_blank"
           :title="$t( 'message.songs_page.find_youtube')"
           :href="encodeURI(`https://www.youtube.com/results?search_query=${liveSongTitle}`)">
          <i class="bi bi-youtube"></i>&nbsp;
          <span class="d-none d-sm-inline">
          {{ $t('message.songs_page.find_youtube') }}
        </span>
        </a>&nbsp;&nbsp;

        <a class="link-no-to-bold" target="_blank"
           :title="$t( 'message.songs_page.find_spotify')"
           :href="encodeURI(`https://open.spotify.com/search/${liveSongTitle}`)">
          <i class="bi bi-spotify"></i>&nbsp;
          <span class="d-none d-sm-inline">
          {{ $t('message.songs_page.find_spotify') }}
        </span>
        </a>&nbsp;&nbsp;

        <a class="link-no-to-bold" target="_blank"
           :title="$t( 'message.songs_page.find_deezer')"
           :href="encodeURI(`https://www.deezer.com/search/${liveSongTitle}`)">
          <img src="/img/deezericon.png" :alt="$t('message.songs_page.find_deezer')">
          &nbsp;<span class="d-none d-sm-inline">
          {{ $t('message.songs_page.find_deezer') }}
        </span>
        </a>&nbsp;&nbsp;

        <a v-if="amazonLink" class="link-no-to-bold" target="_blank"
           :title="$t( 'message.songs_page.buy_amazon')"
           :href="amazonLink">
          <i class="bi bi-amazon"></i>&nbsp;
          <span class="d-none d-sm-inline">
          {{ $t('message.songs_page.buy_amazon') }}
        </span>
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { mapState } from 'pinia';

import type { Radio } from '@/types/radio';
import type { Stream } from '@/types/stream';

/* eslint-disable import/no-cycle */
import { usePlayerStore } from '@/stores/playerStore';
import { useUserStore } from '@/stores/userStore';

import typeUtils from '@/utils/typeUtils';
import PlayerUtils from '@/utils/PlayerUtils';

import PlayerSaveSong from '../Player/Common/PlayerSaveSong.vue';

/* eslint-disable no-undef */
/* eslint-disable camelcase */
export default defineComponent({
  props: {
    stream: {
      type: Object as PropType<Radio|Stream>,
      required: true
    }
  },
  components: {
    PlayerSaveSong
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
  }
});
</script>
