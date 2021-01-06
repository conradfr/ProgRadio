<!-- Inspired from http://seiyria.com/bootstrap-slider/ -->

<template>
  <div id="volume-fader" v-on:mouseover="volumeFocus(true)" v-on:mouseleave="volumeFocus(false)">
    <div class="fader">
      <v-touch
          :enabled="{ pan: true }"
          :pan-options="{ direction: 'vertical', threshold: '5' }"
          v-on:panup="onPan" v-on:pandown="onPan" v-on:panstart="onPanStart">
        <div class="fader-track"></div>
        <div class="fader-handle" :style="styleObject"></div>
      </v-touch>

    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import { mapState } from 'vuex';

const VueTouch = require('vue-touch');

VueTouch.config.pan = {
  direction: 'vertical'
};

Vue.use(VueTouch, { name: 'v-touch' });

let initVolume = null;

export default {
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