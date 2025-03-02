<template>
  <div class="flex-grow-1 text-center">♫  {{ currentSong }}</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'pinia';

/* eslint-disable import/no-cycle */
import { usePlayerStore } from '@/stores/playerStore';

export default defineComponent({
  computed: {
    ...mapState(usePlayerStore, ['currentSong']),
  },
  methods: {

  }
});
</script>
