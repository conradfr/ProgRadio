<template>
  <div class="navbar-player">
    <div class="player-wrap">
      <div class="player-sound" v-on:click="toggleMute">
        <span class="glyphicon glyphicon-volume-off" :class="{ 'player-muted': player.muted }"
              aria-hidden="true"></span>
      </div>
      <div class="player-sound player-sound-fader"
           v-on:mouseover="volumeFocus(true)"
           v-on:mouseleave="volumeFocus(false)"
           v-on:click="volumeClick">
        <span class="glyphicon"
          :class="{ 'glyphicon-volume-up': player.volume > 4,
                          'glyphicon-volume-down': player.volume <= 4 }"
          aria-hidden="true"></span>
      </div>
      <div class="player-playpause" v-on:click="togglePlay"
         :class="{ 'player-playpause-disabled': player.radio === null }">
        <span class="glyphicon icon-round"
          :class="{ 'glyphicon-play': !player.playing, 'glyphicon-pause': player.playing }"
          aria-hidden="true"></span>
      </div>
      <div v-if="player.radio" class="player-name">{{ player.radio.name }}</div>
      <div v-if="!player.radio" class="player-name player-name-help">
        Cliquer sur un logo pour lancer la lecture
      </div>
    </div>
    <volume-fader v-if="displayVolume"/>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

import VolumeFader from './VolumeFader.vue';

export default {
  components: { VolumeFader },
  data() {
    return {
      audio: null,
      volume: 5,
    };
  },
  computed: {
    ...mapState([
      'player'
    ]),
    ...mapGetters([
      'displayVolume'
    ])
  },
  /* eslint-disable func-names */
  watch: {
    'player.playing': function (val) {
      if (val === true) {
        this.play(this.player.radio.streamUrl);
      } else {
        this.stop();
      }
    },
    'player.muted': function (val) {
      if (this.audio !== null) {
        this.audio.muted = val;
      }
    },
    'player.volume': function (val) {
      if (this.audio !== null) {
        this.audio.volume = (val * 0.1);
      }
    },
  },
  methods: {
    toggleMute() {
      this.$store.dispatch('toggleMute');
    },
    togglePlay() {
      this.$store.dispatch('togglePlay');
    },
    play(url) {
      this.audio = new Audio(`${url}?cb=${new Date().getTime()}`);
      this.audio.muted = this.player.muted;
      this.audio.volume = (this.player.volume * 0.1);
      this.audio.play();
    },
    stop() {
      this.audio.pause();
      this.audio = null;
    },
    volumeFocus(status) {
      this.$store.dispatch('volumeFocus', { element: 'icon', status });
    },
    // for mobiles users
    volumeClick() {
      this.$store.dispatch('volumeFocus', { element: 'icon', status: !this.displayVolume });
    },
  }
};
</script>
