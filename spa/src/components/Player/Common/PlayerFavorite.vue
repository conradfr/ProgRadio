<template>
  <div class="player-favorite"
       :title="favoriteTitle"
       :class="{ 'player-favorite-added': isFavorite }"
       @click="$emit('favoriteToggle');">
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
  emits: ['favoriteToggle'],
});
</script>
