<template>
  <div>
    <player></player>
    <toast-container></toast-container>
    <timer-modal></timer-modal>
    <router-view></router-view>
  </div>
</template>

<script>
import throttle from 'lodash/throttle';

import Player from './Player/Player.vue';
import TimerModal from './Player/TimerModal.vue';
import ToastContainer from './Toast/ToastContainer.vue';

export default {
  compatConfig: {
    MODE: 3
  },
  components: {
    Player,
    TimerModal,
    ToastContainer
  },
  created() {
    setTimeout(
      () => {
        this.$store.dispatch('getUserData');
      },
      25
    );

    // links from the navbar that we want to redirect to spa router
    /* eslint-disable no-undef */
    const navLinks = document.getElementsByClassName('spa-link');
    Array.prototype.forEach.call(navLinks, (element) => {
      element.addEventListener('click', (e) => {
        e.preventDefault();
        this.$router.push({ path: e.currentTarget.getAttribute('href') });
      });
    });

    // OS hotkeys support
    if (navigator.mediaSession !== undefined) {
      setTimeout(
        () => {
          navigator.mediaSession.setActionHandler('previoustrack', this.keyPlayPrevious.bind(this));
          navigator.mediaSession.setActionHandler('nexttrack', this.keyPlayNext.bind(this));
          navigator.mediaSession.setActionHandler('play', this.keyPlayPause.bind(this));
          navigator.mediaSession.setActionHandler('pause', this.keyPlayPause.bind(this));
        },
        1000
      );
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
