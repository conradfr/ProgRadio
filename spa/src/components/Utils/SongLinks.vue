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
      <i class="bi bi-boombox-fill"></i>&nbsp;
      <span class="d-none d-sm-inline">{{ $t('message.songs_page.find_deezer') }}</span>
    </a>&nbsp;&nbsp;

    <a class="link-no-to-bold" target="_blank"
       :title="$t( 'message.songs_page.find_itunes')"
       :href="iTunesSearchUrl" @click.prevent="openITunes">
      <i class="bi bi-apple-music"></i>&nbsp;
      <span class="d-none d-sm-inline">{{ $t('message.songs_page.find_itunes') }}</span>
    </a>&nbsp;&nbsp;
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import ITunesApi from '@/api/ITunesApi';

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
    },
  },
  computed: {
    // used if the song is not found, and for anything else than a click (open in a new tab ...)
    iTunesSearchUrl(): string {
      return `https://music.apple.com/search?term=${encodeURIComponent(this.title)}`;
    }
  },
  methods: {
    // the lookup is done on click, as the iTunes api is rate limited
    async openITunes() {
      // opened before the api call, or it would be blocked as a popup
      const tab = window.open('', '_blank');

      if (tab) {
        tab.opener = null;
      }

      let link = null;

      try {
        link = await ITunesApi.getItunesLink(this.title);
      } catch (_e) {
        // we use the search
      }

      const url = link || this.iTunesSearchUrl;

      if (tab) {
        tab.location.href = url;
      } else {
        window.location.href = url;
      }
    }
  }
});
</script>
