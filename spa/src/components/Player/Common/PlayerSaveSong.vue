<template>
  <div class="player-add-song"
    :class="{ 'text-muted': !userLogged || !currentSongTitle , 'cursor-pointer': userLogged }">
    <span class="player-add-song-inner"
      :title="$t(!userLogged ? 'message.player.save_song_not_logged' : (userLogged && !currentSongTitle
        ? 'message.player.save_song_no_title' : 'message.player.save_song'), { song: currentSongTitle })"
      @click="saveSong">
      <i class="bi bi-file-earmark-music"></i>
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapActions } from 'pinia';

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
    ...mapState(useUserStore, { userLogged: 'logged' }),
    currentSongTitle() {
      if (!this.currentSong || !this.currentSong[0]) {
        return null;
      }

      return this.currentSong[0];
    },
  },
  methods: {
    ...mapActions(useUserStore, ['addSong']),
    saveSong() {
      setTimeout(
        () => {
          if (!this.userLogged || this.currentSongTitle === null || this.currentSongTitle.trim() === '') {
            return;
          }

          this.addSong(this.currentSongTitle);

          this.$gtag.event(GTAG_ACTION_SAVE_SONG, {
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
