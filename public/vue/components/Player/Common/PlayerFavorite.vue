<template>
  <div class="player-favorite"
       v-on:click="$emit('favoriteToggle');"
       :title="favoriteTitle"
       :class="{ 'player-favorite-added': isFavorite }">
    <i class="bi"
       :class="{
        'bi-heart-fill': isFavorite,
        'bi-heart': !isFavorite
        }"></i>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    isFavorite: {
      type: Boolean,
      required: true
    },
    favoriteTitle: {
      type: String,
      required: true
    }
  },
  computed: {
    // ...mapState(usePlayerStore, ['currentSong']),
  },
  methods: {

  }
});
</script>
