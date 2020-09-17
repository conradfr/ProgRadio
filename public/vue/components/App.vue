<template>
  <div>
    <player></player>
    <router-view></router-view>
  </div>
</template>

<script>
import throttle from 'lodash/throttle';

import Player from './Player.vue';

export default {
  components: {
    Player
  },
  created() {
    // put here so any streaming preloaded on the player will have its correct favorite status
    this.$store.dispatch('getFavorites');

    // OS hotkeys support
    if (navigator.mediaSession !== undefined) {
      navigator.mediaSession.setActionHandler('previoustrack', this.keyPlayPrevious.bind(this));
      navigator.mediaSession.setActionHandler('nexttrack', this.keyPlayNext.bind(this));
      navigator.mediaSession.setActionHandler('play', this.keyPlayPause.bind(this));
      navigator.mediaSession.setActionHandler('pause', this.keyPlayPause.bind(this));
    }

    // making the router works on IE 11 https://github.com/vuejs/vue-router/issues/1849
    if ('-ms-scroll-limit' in document.documentElement.style
        && '-ms-ime-align' in document.documentElement.style) { // detect it's IE11
      window.addEventListener('hashchange', () => {
        const currentPath = window.location.hash.slice(1);
        if (this.$route.path !== currentPath) {
          this.$router.push(currentPath);
        }
      }, false);
    }
  },
  methods: {
    /* eslint-disable func-names */
    keyPlayPause: throttle(function () { this.$store.dispatch('togglePlay'); }, 200,
      { leading: true, trailing: false }),
    keyPlayPrevious: throttle(function () { this.$store.dispatch('playPrevious'); }, 200,
      { leading: true, trailing: false }),
    keyPlayNext: throttle(function () { this.$store.dispatch('playNext'); }, 200,
      { leading: true, trailing: false }),
  }
};
</script>
