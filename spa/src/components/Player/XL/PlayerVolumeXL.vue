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
    <vue3-slider v-model="volumeSlider" color="#337ab7" track-color="#F9F9F9"
      :handleScale="2.5" :alwaysShowHandle="true" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapActions } from 'pinia';
import slider from 'vue3-slider';

import { usePlayerStore } from '@/stores/playerStore';

export default defineComponent({
  components: {
    'vue3-slider': slider
  },
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
