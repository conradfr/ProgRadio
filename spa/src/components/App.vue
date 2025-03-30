<template>
  <player></player>
  <toast-container></toast-container>
  <timer-modal></timer-modal>
  <player-video-modal />
  <router-view v-slot="{ Component }">
    <Transition name="viewfade">
      <component :is="Component" />
    </Transition>
  </router-view>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapActions } from 'pinia';

import { useGlobalStore } from '@/stores/globalStore';
import { useUserStore } from '@/stores/userStore';

import {
  COOKIE_HOME,
  GTAG_CATEGORY_MENU,
  GTAG_ACTION_HOME_SET,
  GTAG_ACTION_HOME_REMOVE,
  GTAG_ACTION_HOME_VALUE
} from '@/config/config';

import cookies from '@/utils/cookies';

import Player from './Player/Player.vue';
import TimerModal from './Timer/TimerModal.vue';
import PlayerVideoModal from './Player/PlayerVideoModal.vue';
import ToastContainer from './Toast/ToastContainer.vue';

export default defineComponent({
  components: {
    Player,
    TimerModal,
    PlayerVideoModal,
    ToastContainer
  },
  created() {
    setTimeout(
      () => {
        this.getUserData();
      },
      5
    );

    setTimeout(
      () => {
        // links from the navbar that we want to redirect to spa router
        const navLinks = document.getElementsByClassName('spa-link');

        Array.prototype.forEach.call(navLinks, (element) => {
          element.addEventListener('click', (e: any) => {
            e.preventDefault();
            this.$router.push({ path: e.currentTarget.getAttribute('href') });
          });
        });
      },
      25
    );

    const toggleHomeLinks = (homeIsSet: boolean) => {
      const classToShow = homeIsSet ? 'nav-set-home-disable' : 'nav-set-home-enable';
      const classToHide = homeIsSet ? 'nav-set-home-enable' : 'nav-set-home-disable';

      const toShow = document.getElementsByClassName(classToShow);
      Array.prototype.forEach.call(toShow, (element) => {
        element.classList.remove('d-none');
      });

      const toHide = document.getElementsByClassName(classToHide);
      Array.prototype.forEach.call(toHide, (element) => {
        element.classList.add('d-none');
      });
    };

    // "set as home screen" link in menu
    const navSetAsHomeLinks = document.getElementsByClassName('nav-set-home');
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
              message: this.$i18n.t('message.toast.home.disabled')
            });

          this.$gtag.event(GTAG_ACTION_HOME_REMOVE, {
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
            message: this.$i18n.t('message.toast.home.enabled')
          });

        this.$gtag.event(GTAG_ACTION_HOME_SET, {
          event_category: GTAG_CATEGORY_MENU,
          event_label: `${window.location.pathname}${window.location.search}`,
          value: GTAG_ACTION_HOME_VALUE
        });
      });
    });
  },
  methods: {
    ...mapActions(useUserStore, ['getUserData']),
    ...mapActions(useGlobalStore, ['displayToast']),
  }
});
</script>
