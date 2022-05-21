<template>
  <div id="volume-fader" v-on:mouseover="volumeFocus(true)" v-on:mouseleave="volumeFocus(false)">
    <div class="fader">
      <vue3-hammer
          :enabled="{ pan: true }"
          :panOptions="{ direction: 'vertical', threshold: '5' }"
          v-on:panup="onPan" v-on:pandown="onPan" v-on:panstart="onPanStart">
        <div class="fader-track"></div>
        <div class="fader-handle" :style="styleObject"></div>
      </vue3-hammer>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapState, mapActions } from 'pinia';

/* eslint-disable import/no-cycle */
import { usePlayerStore } from '@/stores/playerStore';

import Vue3Hammer from '../Utils/Vue3Hammer.vue';

let initVolume: number|null = null;

export default defineComponent({
  components: {
    Vue3Hammer
  },
  computed: {
    ...mapState(usePlayerStore, ['volume']),
    styleObject(): object {
      // values are reversed as 0% = a volume of 10
      const top = ((10 - this.volume) * 10);

      return {
        top: `${top}%`
      };
    },
  },
  methods: {
    ...mapActions(usePlayerStore, {
      setVolume: 'setVolume',
      volumeFocusDispatch: 'volumeFocus'
    }),
    onPanStart() {
      initVolume = this.volume;
    },
    onPan(event: Event) {
      const deltaY = Math.round((event as any).deltaY / 10);

      let newVolume = +initVolume! + (deltaY * -1);

      if (newVolume === this.volume) {
        return;
      }

      if (newVolume < 0) {
        if (this.volume > 0) {
          newVolume = 0;
        } else {
          return;
        }
      } else if (newVolume > 10) {
        if (this.volume < 10) {
          newVolume = 10;
        } else {
          return;
        }
      }

      this.setVolume(newVolume);
    },
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
