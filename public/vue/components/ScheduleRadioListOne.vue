<template>
  <a v-on:click="play" :title="radio.name" :style="styleObject">
    <div class="radio-logo"
         :class="{'radio-logo-nohover':  (radio.streaming_enabled === false)}"
         :title="radio.name" :style="styleObject">
      <div class="radio-logo-play"
         :class="{
          'radio-logo-play-active': (radio.code_name === radioPlayingCodeName),
          'radio-logo-play-hide': (radio.streaming_enabled === false)
      }">
      </div>
    </div>
  </a>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  props: ['radio'],
  data() {
    return {
      styleObject: {
        backgroundImage: `url("/img/radio/schedule/${this.radio.code_name}.png")`
      }
    };
  },
  computed: {
    ...mapGetters([
      'radioPlayingCodeName'
    ])
  },
  methods: {
    play() {
      if (this.radio.streaming_enabled === true) {
        this.$store.dispatch('play', this.radio.code_name);
      }
    }
  }
};
</script>
