<template>
  <div class="player-logo-xl d-none d-md-block">
    <img :src="imgSrc" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import type { Stream } from '@/types/stream';
import type { Radio } from '@/types/radio';

import StreamsUtils from '@/utils/StreamsUtils';

export default defineComponent({
  props: {
    stream: {
      type: Object as PropType<Stream>,
      required: true
    },
    radio: {
      type: Object as PropType<Radio>,
      required: false
    },
  },
  computed: {
    imgSrc() {
      return StreamsUtils.getPictureUrl(this.stream, this.radio);
    }
  },
});
</script>
