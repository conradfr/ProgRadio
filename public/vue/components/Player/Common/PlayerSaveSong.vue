<template>
  <div class="player-add-song">
    <span class="player-add-song-inner"
         v-on:click="saveSong"
         :title="$t('message.player.save_song', { song: currentSong })">
      <i class="bi bi-file-earmark-music"></i>
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapActions } from 'pinia';

/* eslint-disable import/no-cycle */
import { useUserStore } from '@/stores/userStore';
import { usePlayerStore } from '@/stores/playerStore';

import {
  GTAG_ACTION_SAVE_SONG,
  GTAG_CATEGORY_PLAYER,
  GTAG_ACTION_SAVE_SONG_VALUE
} from '@/config/config';

export default defineComponent({
  computed: {
    ...mapState(usePlayerStore, ['currentSong']),
  },
  methods: {
    ...mapActions(useUserStore, ['addSong']),
    saveSong() {
      setTimeout(
        async () => {
          if (this.currentSong === null || this.currentSong.trim() === '') {
            return;
          }

          this.addSong(this.currentSong);

          (this as any).$gtag.event(GTAG_ACTION_SAVE_SONG, {
            event_category: GTAG_CATEGORY_PLAYER,
            event_label: null,
            value: GTAG_ACTION_SAVE_SONG_VALUE
          });
        },
        25
      );
    }
  }
});
</script>
