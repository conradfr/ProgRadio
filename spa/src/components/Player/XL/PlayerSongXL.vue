<template>
  <div class="navbar-player-song flex-grow-1 d-flex justify-content-center align-items-center">
    <div v-if="currentSongCover" class="navbar-player-xl-logo me-3">
      <img :src="currentSongCover" />
    </div>
    <div>♫  {{ currentSongTitle }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'pinia';

/* eslint-disable import/no-cycle */
import { usePlayerStore } from '@/stores/playerStore';

export default defineComponent({
  computed: {
    ...mapState(usePlayerStore, ['currentSong']),
    currentSongTitle() {
      if (!this.currentSong || !this.currentSong[0]) {
        return null;
      }

      return this.currentSong[0];
    },
    currentSongCover() {
      if (!this.currentSong || !this.currentSong[1]) {
        return null;
      }

      return this.currentSong[1];
    }
  },
  methods: {

  }
});
</script>
