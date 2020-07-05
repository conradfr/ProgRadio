<template>
  <div class="streams-one" v-on:click="play"
       :class="{
          'streams-one-play-active': (radio.code_name === radioPlayingCodeName),
          'streams-one-play-paused': (playing === false && radio.code_name === radioPlayingCodeName)
  }">
    <div v-if="selectedCountry.code === 'all' && radio.country_code !== null"
       class="streams-one-flag">
      <gb-flag
          :code="radio.country_code"
          size="micro"
      />
    </div>
    <div class="streams-one-img" :style="styleObject">
      <div class="streams-one-img-play"></div>
    </div>
    <div class="streams-one-name" :title="radio.name">{{ radio.name }}
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import VueFlags from '@growthbunker/vueflags';

import { mapGetters, mapState } from 'vuex';
import { THUMBNAIL_STREAM_PATH } from '../config/config';

Vue.use(VueFlags, {
  // Specify the path of the folder where the flags are stored.
  iconPath: '/img/flags/',
});

export default {
  props: ['radio'],
  data() {
    const img = (this.radio.img === null || this.radio.img === '') ? '/img/stream-placeholder.png'
      : `${THUMBNAIL_STREAM_PATH}${this.radio.img}`;
    return {
      styleObject: {
        backgroundImage: `url("${img}")`
      }
    };
  },
  computed: {
    ...mapState({
      playing: state => state.player.playing,
      selectedCountry: state => state.streams.selectedCountry,
    }),
    ...mapGetters([
      'radioPlayingCodeName',
    ]),
  },
  methods: {
    play() {
      this.$store.dispatch('playStream', this.radio);
    }
  }
};
</script>
