<template>
  <div class="navbar-player-xl-logo">
    <img :src="imgSrc" :alt="radio.name" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'pinia';

import StreamsUtils from '@/utils/StreamsUtils';

/* eslint-disable import/no-cycle */
import { usePlayerStore } from '@/stores/playerStore';

export default defineComponent({
  computed: {
    ...mapState(usePlayerStore, ['radio']),
    imgSrc() {
      return StreamsUtils.getPictureUrl(this.radio);
    }
  },
  methods: {

  }
});
</script>
