<template>
  <div class="player-volume p-3 px-3 d-flex align-items-center"
    v-on:mouseover="volumeFocus(true)" v-on:mouseleave="volumeFocus(false)">
    <vue3-slider v-model="volumeSlider" color="#337ab7" track-color="#F9F9F9"
      orientation="vertical" :handleScale="2.5" :alwaysShowHandle="true" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapActions } from 'pinia';
import slider from 'vue3-slider';

/* eslint-disable import/no-cycle */
import { usePlayerStore } from '@/stores/playerStore';

export default defineComponent({
  components: {
    'vue3-slider': slider
  },
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
