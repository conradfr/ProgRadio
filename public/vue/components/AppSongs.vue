<template>
  <div class="container now-page">
    <div class="row">
      <div class="col-12 col-sm-9">
        <h4 class="mt-2 mb-4">{{ $t('message.songs_page.title') }}</h4>

        <table v-if="Object.keys(songs).length > 0" class="table table-striped table-songs">
          <tbody>
            <tr v-for="(song, index) in songs" :key="index">
              <td  class="ps-3" style="width: 60%;">{{ song }}</td>
              <td class="text-center" style="width: 25%;">
                <a class="link-no-to-bold" target="_blank"
                   :title="$t( 'message.songs_page.find_youtube')"
                   :href="encodeURI(`https://www.youtube.com/results?search_query=${song}`)">
                  <i class="bi bi-youtube"></i>&nbsp;&nbsp;
                </a>&nbsp;&nbsp;
                <a class="link-no-to-bold" target="_blank"
                   :title="$t( 'message.songs_page.find_spotify')"
                   :href="encodeURI(`https://open.spotify.com/search/${song}`)">
                  <i class="bi bi-spotify"></i>&nbsp;&nbsp;
                </a>&nbsp;&nbsp;
                <a class="link-no-to-bold" target="_blank"
                   :title="$t( 'message.songs_page.find_deezer')"
                   :href="encodeURI(`https://www.deezer.com/search/${song}`)">
                  <img src="/img/deezericon.png" :alt="$t('message.songs_page.find_deezer')">
                </a>
                <a v-if="amazonLink(song)" class="link-no-to-bold" target="_blank"
                   :title="$t( 'message.songs_page.buy_amazon')"
                   :href="amazonLink(song)">
                  <i class="bi bi-amazon"></i>&nbsp;&nbsp;
                </a>&nbsp;&nbsp;
              </td>
              <td class="text-end pe-3" style="width: 15%;">
                <a class="link-no-to-bold" v-on:click="removeSong(index)">
                  <i class="bi bi-trash3-fill"></i>&nbsp;&nbsp;
                  <span class="d-none d-sm-inline">
                    {{ $t('message.generic.delete') }}
                  </span>
                </a>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="Object.keys(songs).length === 0" class="mt-5">
          <p class="text-center mb-5">{{ $t('message.songs_page.no_songs') }}</p>
          <div class="text-center"><img class="img-fluid" src="/img/songsave.png" alt=""></div>
        </div>

      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapActions } from 'pinia';

/* eslint-disable import/no-cycle */
import { useUserStore } from '@/stores/userStore';

import {
  GTAG_ACTION_REMOVE_SONG,
  GTAG_ACTION_REMOVE_SONG_VALUE,
  GTAG_CATEGORY_SONGS
} from '@/config/config';

import PlayerUtils from '@/utils/PlayerUtils';

export default defineComponent({
  mounted() {
    document.title = (this.$i18n as any).t('message.songs_page.title');
  },
  computed: {
    ...mapState(useUserStore, ['songs'])
  },
  methods: {
    ...mapActions(useUserStore, ['deleteSong']),
    amazonLink(song: string) {
      if (!song || song === '') {
        return null;
      }

      return PlayerUtils.getAmazonSongLink(song);
    },
    removeSong(songId: number) {
      this.deleteSong(songId);

      (this as any).$gtag.event(GTAG_ACTION_REMOVE_SONG, {
        event_category: GTAG_CATEGORY_SONGS,
        event_label: null,
        value: GTAG_ACTION_REMOVE_SONG_VALUE
      });
    }
  }
});
</script>
