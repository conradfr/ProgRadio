<template>
  <div class="player-add-song"
    :class="{ 'text-muted': !userLogged || !liveSongTitle , 'cursor-pointer': userLogged }">
    <span class="player-add-song-inner"
      :title="$t(!userLogged ? 'message.player.save_song_not_logged' : (userLogged && !liveSongTitle
        ? 'message.player.save_song_no_title' : 'message.player.save_song'), { song: liveSongTitle })"
      @click="saveSong">
      <i class="bi bi-file-earmark-music"></i>
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import { mapState, mapActions } from 'pinia';

import type { Stream } from '@/types/stream.ts';

import { useUserStore } from '@/stores/userStore';
import { usePlayerStore } from '@/stores/playerStore';

import {
  GTAG_ACTION_SAVE_SONG,
  GTAG_CATEGORY_PLAYER,
  GTAG_ACTION_SAVE_SONG_VALUE
} from '@/config/config';

export default defineComponent({
  props: {
    stream: {
      type: Object as PropType<Stream>,
      required: true
    }
  },
  computed: {
    ...mapState(usePlayerStore, ['currentSong']),
    ...mapState(usePlayerStore, ['liveSong']),
    ...mapState(useUserStore, { userLogged: 'logged' }),
    liveSongData() {
      return this.liveSong(this.stream);
    },
    liveSongTitle() {
      return this.liveSongData && this.liveSongData[0] ? this.liveSongData[0] : null;
    },
  },
  methods: {
    ...mapActions(useUserStore, ['addSong']),
    saveSong() {
      setTimeout(
        () => {
          if (!this.userLogged || this.liveSongTitle === null || this.liveSongTitle.trim() === '') {
            return;
          }

          this.addSong(this.liveSongTitle, this.stream.id);

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
