<template>
  <div class="navbar-player">
    <div class="player-wrap">
      <div class="player-sound player-sound-mute" v-on:click="toggleMute">
        <span class="glyphicon glyphicon-volume-off" aria-hidden="true"
              :class="{ 'player-muted': player.muted }"></span>
      </div>
      <div class="player-sound player-sound-fader"
           v-on:mouseover="volumeFocus(true)"
           v-on:mouseleave="volumeFocus(false)"
           v-on:click.stop="toggleMute">
        <span class="glyphicon"
          :class="{
            'glyphicon-volume-off': player.muted || player.focus.icon,
            'player-muted': player.muted,
            'glyphicon-volume-up': !(player.muted || player.focus.icon) && player.volume > 4,
            'glyphicon-volume-down': !(player.muted || player.focus.icon) && player.volume <= 4
                  }"
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
      /*
        As the volume icon may be shown instead of the mute icon on tablets and a click event
        also triggers a mouseover event before it, we avoid showing the volume fader if a mouseover
        is immediately followed by a click
      */
      debounce: false
    };
  },
  mounted() {
    window.togglePlaybackStatus = this.togglePlay;
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

      this.debounce = true;
      setTimeout(
        () => {
          this.debounce = false;
        },
        300
      );
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
      setTimeout(
        () => {
          if (this.debounce === false) {
            this.$store.dispatch('volumeFocus', { element: 'icon', status });
          }
        },
        200
      );
    }
  }
};
</script>
