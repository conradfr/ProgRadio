<template>
  <div class="player-logo-xl d-none d-md-block">
    <img :src="imgSrc" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'pinia';

import StreamsUtils from '@/utils/StreamsUtils';

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
