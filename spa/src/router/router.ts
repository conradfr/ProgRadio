import {
  // createWebHashHistory,
  createWebHistory,
  createRouter
} from 'vue-router';

import { COOKIE_HOME } from '@/config/config';

import cookies from '@/utils/cookies';

const AppRadio = () => import('../components/AppRadio.vue');
const AppNow = () => import('../components/AppNow.vue');
const AppParams = () => import('../components/AppParams.vue');
const AppSongs = () => import('../components/AppSongs.vue');
const AppSchedule = () => import('../components/AppSchedule.vue');
const AppStreams = () => import('../components/AppStreams.vue');

const SCROLL_TO_HASH_TIMEOUT_MS = 3000;
const SCROLL_TO_HASH_INTERVAL_MS = 50;

const routes = [
  {
    path: '/:lang/streaming/:countryOrCategoryOrUuid/:page?',
    name: 'streaming',
    component: AppStreams
  },
  {
    path: '/:lang/streaming',
    name: 'streaming_home',
    component: AppStreams
  },
  {
    path: '/:lang/schedule/:collection?',
    name: 'schedule',
    component: AppSchedule
  },
  {
    path: '/:lang/schedule',
    name: 'schedule_home',
    component: AppSchedule
  },
  {
    path: '/:lang/radio/:radio',
    name: 'radio',
    component: AppRadio
  },
  {
    path: '/:lang/now',
    name: 'now',
    component: AppNow
  },
  {
    path: '/:lang/params',
    name: 'params',
    component: AppParams
  },
  {
    path: '/:lang/songs',
    name: 'songs',
    component: AppSongs
  },
  {
    path: '/:lang/',
    name: 'default',
    component: AppSchedule,
    beforeEnter: () => {
      if (cookies.has(COOKIE_HOME)) {
        return { path: decodeURIComponent(cookies.get(COOKIE_HOME)) };
      }

      return true;
    },
  }
];

// Pages such as the radio one render their content only once the schedule has
// been fetched, so an anchor target does not exist yet when the navigation
// settles. Wait for it rather than scrolling to nothing, but give up eventually.
const waitForElement = (selector: string): Promise<Element|null> => new Promise((resolve) => {
  const startedAt = Date.now();

  const check = () => {
    const element = document.querySelector(selector);

    if (element !== null) {
      resolve(element);
      return;
    }

    if (Date.now() - startedAt >= SCROLL_TO_HASH_TIMEOUT_MS) {
      resolve(null);
      return;
    }

    setTimeout(check, SCROLL_TO_HASH_INTERVAL_MS);
  };

  check();
});

export default createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (to.hash) {
      return waitForElement(to.hash)
        .then(element => (element === null ? false : { el: to.hash, behavior: 'smooth' as const }));
    }

    if (savedPosition) {
      return savedPosition;
    }

    return { top: 0 };
  }
});
