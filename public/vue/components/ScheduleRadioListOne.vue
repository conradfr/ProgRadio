<template>
  <a v-on:click="play" :title="radio.name" :style="styleObject">
    <div class="radio-logo" :title="radio.name" :style="styleObject">
      <div class="radio-logo-play"
           :class="{ 'radio-logo-play-active': (radio.code_name === radioPlayingCodeName) }">
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
      this.$store.dispatch('play', this.radio.code_name);
    }
  }
};
</script>
