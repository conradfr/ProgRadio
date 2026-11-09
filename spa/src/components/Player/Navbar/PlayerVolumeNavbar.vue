<template>
  <div class="player-volume p-3 px-3 d-flex align-items-center justify-content-center"
    @mouseover="volumeFocus(true)" @mouseleave="volumeFocus(false)">
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
      volumeFocusDispatch: 'volumeFocus'
    }),
    volumeFocus(status: boolean) {
      this.volumeFocusDispatch(
        {
          element: 'fader',
          status
        });
    },
  }
});
</script>
