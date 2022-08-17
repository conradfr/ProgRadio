<template>
  <div>
    <player></player>
    <toast-container></toast-container>
    <timer-modal v-if="timerDisplay"></timer-modal>
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapActions, mapState } from 'pinia';
import throttle from 'lodash/throttle';

import { useGlobalStore } from '@/stores/globalStore';
import { useUserStore } from '@/stores/userStore';
import { usePlayerStore } from '@/stores/playerStore';

import {
  COOKIE_HOME,
  GTAG_CATEGORY_MENU,
  GTAG_ACTION_HOME_SET,
  GTAG_ACTION_HOME_REMOVE,
  GTAG_ACTION_HOME_VALUE
} from '@/config/config';

import cookies from '../utils/cookies';
import Player from './Player/Player.vue';
import TimerModal from './Timer/TimerModal.vue';
import ToastContainer from './Toast/ToastContainer.vue';

export default defineComponent({
  components: {
    Player,
    TimerModal,
    ToastContainer
  },
  created() {
    setTimeout(
      () => {
        this.getUserData();
      },
      25
    );

    // links from the navbar that we want to redirect to spa router
    /* eslint-disable no-undef */
    const navLinks = document.getElementsByClassName('spa-link')!;

    Array.prototype.forEach.call(navLinks, (element) => {
      element.addEventListener('click', (e: any) => {
        e.preventDefault();
        this.$router.push({ path: e.currentTarget.getAttribute('href') });
      });
    });

    const toggleHomeLinks = (homeIsSet: boolean) => {
      const classToShow = homeIsSet ? 'nav-set-home-disable' : 'nav-set-home-enable';
      const classToHide = homeIsSet ? 'nav-set-home-enable' : 'nav-set-home-disable';

      const toShow = document.getElementsByClassName(classToShow)!;
      Array.prototype.forEach.call(toShow, (element) => {
        element.classList.remove('d-none');
      });

      const toHide = document.getElementsByClassName(classToHide)!;
      Array.prototype.forEach.call(toHide, (element) => {
        element.classList.add('d-none');
      });
    };

    // "set as homescreen" link in menu
    const navSetAsHomeLinks = document.getElementsByClassName('nav-set-home')!;
    toggleHomeLinks(cookies.has(COOKIE_HOME));

    Array.prototype.forEach.call(navSetAsHomeLinks, (element) => {
      element.classList.remove('d-none');
      element.addEventListener('click', (e: any) => {
        e.preventDefault();

        // Remove if this path is already set
        if (cookies.has(COOKIE_HOME)) {
          cookies.remove(COOKIE_HOME);

          this.displayToast(
            {
              type: 'success',
              message: (this.$i18n as any).tc('message.toast.home.disabled')
            });

          (this as any).$gtag.event(GTAG_ACTION_HOME_REMOVE, {
            event_category: GTAG_CATEGORY_MENU,
            value: GTAG_ACTION_HOME_VALUE
          });

          toggleHomeLinks(false);
          return;
        }

        cookies.set(
          COOKIE_HOME,
          encodeURIComponent(`${window.location.pathname}${window.location.search}`)
        );
        toggleHomeLinks(true);
        this.displayToast(
          {
            type: 'success',
            message: (this.$i18n as any).tc('message.toast.home.enabled')
          });

        (this as any).$gtag.event(GTAG_ACTION_HOME_SET, {
          event_category: GTAG_CATEGORY_MENU,
          event_label: `${window.location.pathname}${window.location.search}`,
          value: GTAG_ACTION_HOME_VALUE
        });
      });
    });

    // OS hotkeys support
    if (navigator.mediaSession !== undefined) {
      setTimeout(
        () => {
          /* eslint-disable max-len */
          navigator.mediaSession.setActionHandler('previoustrack', this.keyPlayPrevious.bind(this));
          navigator.mediaSession.setActionHandler('nexttrack', this.keyPlayNext.bind(this));
          navigator.mediaSession.setActionHandler('play', this.keyPlayPause.bind(this));
          navigator.mediaSession.setActionHandler('pause', this.keyPlayPause.bind(this));
        },
        1000
      );
    }
  },
  computed: mapState(usePlayerStore, ['timerDisplay']),
  methods: {
    ...mapActions(useUserStore, ['getUserData']),
    ...mapActions(useGlobalStore, ['displayToast']),
    ...mapActions(usePlayerStore, ['togglePlay', 'playPrevious', 'playNext']),
    /* eslint-disable func-names */
    /* eslint-disable max-len */
    /* eslint-disable no-unused-vars */
    keyPlayPause() { throttle(function (this: any) { this.togglePlay(); }, 200, { leading: true, trailing: false }); },
    keyPlayPrevious() { throttle(function (this: any) { this.playPrevious(); }, 200, { leading: true, trailing: false }); },
    keyPlayNext() { throttle(function (this: any) { this.playNext(); }, 200, { leading: true, trailing: false }); },
  }
});
</script>
