import {
  // createWebHashHistory,
  createWebHistory,
  createRouter,
  RouterLink,
  RouterView
} from 'vue-router';

import cookies from '../utils/cookies';

import { COOKIE_HOME } from '../config/config';

import AppRadio from '../components/AppRadio.vue';
import AppNow from '../components/AppNow.vue';
import AppParams from '../components/AppParams.vue';
import AppSchedule from '../components/AppSchedule.vue';
import AppStreams from '../components/AppStreams.vue';

RouterLink.compatConfig = {
  MODE: 3,
};

RouterView.compatConfig = {
  MODE: 3,
};

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

export default createRouter({
  history: createWebHistory(),
  routes
});
