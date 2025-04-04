<template>
  <div class="container now-page">
    <div class="row">
      <div class="col-12">
        <h4 class="mt-2 mb-4">{{ $t('message.songs_page.title') }}</h4>

        <table v-if="Object.keys(songs).length > 0" class="table table-striped table-songs">
          <tbody>
            <tr v-for="(song, index) in songs" :key="index">
              <td class="ps-3" style="width: 60%;">{{ song }}</td>
              <td style="width: 25%;">
                <song-links :title="song" additional-class="d-flex justify-content-center streaming-services" />
              </td>
              <td class="text-end pe-3" style="width: 13%;">
                <a class="link-no-to-bold" @click="removeSong(index)">
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
          <p class="text-center mb-5">
            {{ $t('message.songs_page.no_songs') }}
          </p>
          <div class="text-center">
            <img class="img-fluid" src="/img/songsave.png" alt="">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapActions } from 'pinia';

import { useUserStore } from '@/stores/userStore';

import SongLinks from './Utils/SongLinks.vue';

import {
  GTAG_ACTION_REMOVE_SONG,
  GTAG_ACTION_REMOVE_SONG_VALUE,
  GTAG_CATEGORY_SONGS
} from '@/config/config';

import PlayerUtils from '@/utils/PlayerUtils';

export default defineComponent({
  components: {
    SongLinks
  },
  mounted() {
    document.title = this.$i18n.t('message.songs_page.title');
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

      this.$gtag.event(GTAG_ACTION_REMOVE_SONG, {
        event_category: GTAG_CATEGORY_SONGS,
        event_label: null,
        value: GTAG_ACTION_REMOVE_SONG_VALUE
      });
    }
  }
});
</script>
