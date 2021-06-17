<!-- Inspired from http://seiyria.com/bootstrap-slider/ -->

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

<script>
import { mapState } from 'vuex';

import Vue3Hammer from '../Utils/Vue3Hammer.vue';

let initVolume = null;

export default {
  compatConfig: {
    MODE: 3
  },
  components: {
    Vue3Hammer
  },
  computed: {
    styleObject() {
      // values are reversed as 0% = a volume of 10
      const top = ((10 - this.volume) * 10);

      return {
        top: `${top}%`
      };
    },
    ...mapState({
      volume: state => state.player.volume
    })
  },
  methods: {
    onPanStart() {
      initVolume = this.volume;
    },
    onPan(event) {
      const deltaY = Math.round(event.deltaY / 10);

      let newVolume = +initVolume + (deltaY * -1);

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

      this.$store.dispatch('setVolume', newVolume.toString());
    },
    volumeFocus(status) {
      this.$store.dispatch('volumeFocus',
        {
          element: 'fader',
          status
        });
    },
  }
};
</script>
