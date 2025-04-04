<template>
  <div class="player-song-xl flex-grow-1 d-flex justify-content-start align-items-center cursor-pointer"
    @click="gotoRadio">
    <div v-if="currentSongCover" class="player-logo-xl me-3">
      <img :src="currentSongCover" />
    </div>
    <div>♫  {{ currentSongTitle }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'pinia';

import { usePlayerStore } from '@/stores/playerStore';

import typeUtils from '@/utils/typeUtils.ts';

export default defineComponent({
  computed: {
    ...mapState(usePlayerStore, ['radio', 'currentSong']),
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
    gotoRadio() {
      if (!this.radio) {
        return;
      }

      if (typeUtils.isRadio(this.radio)) {
        this.$router.push({
          name: 'radio',
          params: { radio: this.radio.code_name }
        });
      } else {
        this.$router.push({
          name: 'streaming',
          params: { countryOrCategoryOrUuid: this.radio.code_name, page: null }
        });
      }
    }
  }
});
</script>
