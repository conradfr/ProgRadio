<template>
  <div class="player-playpause" v-on:click="$emit('togglePlay');"
       :class="{ 'player-playpause-disabled': radio === null }">
    <i
        v-if="playing !== PlayerStatus.Loading"
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
      required: false
    },
    playing: {
      type: String,
      required: true
    }
  },
  /* eslint-disable indent */
  data(): {
    PlayerStatus: any,
  } {
    return {
      PlayerStatus,
    };
  },
  computed: {

  },
  methods: {

  }
});
</script>
