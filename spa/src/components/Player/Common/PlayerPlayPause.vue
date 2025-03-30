<template>
  <div class="player-playpause" :class="{ 'player-playpause-disabled': radio === null }"
    @click="$emit('togglePlay');">
    <i v-if="playing !== PlayerStatus.Loading"
        class="bi"
        :class="{
            'bi-play-circle': playing === PlayerStatus.Stopped,
            'bi-pause-circle': playing !== PlayerStatus.Stopped
          }"></i>
    <div
        v-if="playing === PlayerStatus.Loading"
        class="spinner-border spinner-border-sm" role="status"
        style="width: 1em; height: 1em;">
      <span class="visually-hidden">Loading....</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { PropType } from 'vue';

import PlayerStatus from '@/types/player_status';
import type { Radio } from '@/types/radio';
import type { Stream } from '@/types/stream';

export default defineComponent({
  props: {
    radio: {
      type: Object as PropType<Radio|Stream>,
      required: false,
      default: null
    },
    playing: {
      type: String,
      required: true
    }
  },
  data(): {
    PlayerStatus: any,
  } {
    return {
      PlayerStatus,
    };
  },
  emits: ['togglePlay'],
});
</script>
