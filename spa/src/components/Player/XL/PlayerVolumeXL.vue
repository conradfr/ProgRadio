<template>
  <div class="player-volume-xl me-4 d-flex align-items-center">
    <div class="player-sound me-3" @click.stop="$emit('toggleMute')">
      <i class="bi"
         :class="{
            'bi-volume-mute-fill': muted,
            'player-muted': muted,
            'bi-volume-up-fill': !muted && volume > 4,
            'bi-volume-down-fill': !muted && volume <= 4
          }"></i>
    </div>
    <input v-model.number="volumeSlider" type="range" class="player-volume-range" min="0" max="100" step="1"
      :style="{ '--range-value': volumeSlider / 100 }"
      :aria-label="$t('message.player.volume')" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapActions } from 'pinia';

import { usePlayerStore } from '@/stores/playerStore';

export default defineComponent({
  props: {
    muted: {
      type: Boolean,
      required: true
    },
  },
  emits: ['toggleMute'],
  computed: {
    ...mapState(usePlayerStore, ['volume']),
    volumeSlider: {
      get() {
        return this.volume * 10;
      },
      set(value: number) {
        this.setVolume(value / 10);
      }
    },
  },
  methods: {
    ...mapActions(usePlayerStore, {
      setVolume: 'setVolume',
    }),
  }
});
</script>
