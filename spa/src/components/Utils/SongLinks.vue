<template>
  <div :class="additionalClass">
    <a class="link-no-to-bold" target="_blank"
       :title="$t( 'message.songs_page.find_youtube')"
       :href="encodeURI(`https://www.youtube.com/results?search_query=${title}`)">
      <i class="bi bi-youtube"></i>&nbsp;
      <span class="d-none d-sm-inline">{{ $t('message.songs_page.find_youtube') }}</span>
    </a>&nbsp;&nbsp;

    <a class="link-no-to-bold" target="_blank"
       :title="$t( 'message.songs_page.find_spotify')"
       :href="encodeURI(`https://open.spotify.com/search/${title}`)">
      <i class="bi bi-spotify"></i>&nbsp;
      <span class="d-none d-sm-inline">{{ $t('message.songs_page.find_spotify') }}</span>
    </a>&nbsp;&nbsp;

    <a class="link-no-to-bold" target="_blank"
       :title="$t( 'message.songs_page.find_deezer')"
       :href="encodeURI(`https://www.deezer.com/search/${title}`)">
      <img :src="`${$CDN_BASE_URL}img/deezericon.png`" :alt="$t('message.songs_page.find_deezer')">
      &nbsp;<span class="d-none d-sm-inline">{{ $t('message.songs_page.find_deezer') }}</span>
    </a>&nbsp;&nbsp;
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import PlayerUtils from '@/utils/PlayerUtils.ts';

export default defineComponent({
  props: {
    title: {
      type: String,
      required: true
    },
    additionalClass: {
      type: String,
      required: false,
      default: ''
    }
  },
});
</script>
