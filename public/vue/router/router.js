import {
  createWebHashHistory,
  createRouter,
  RouterLink,
  RouterView
} from 'vue-router';

import AppRadio from '../components/AppRadio.vue';
import AppNow from '../components/AppNow.vue';
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
    path: '/streaming',
    name: 'streaming_home',
    component: AppStreams
  },
  {
    path: '/streaming/:countryOrCategoryOrUuid?',
    name: 'streaming',
    component: AppStreams
  },
  {
    path: '/schedule',
    name: 'schedule_home',
    component: AppSchedule
  },
  {
    path: '/schedule/:collection?',
    name: 'schedule',
    component: AppSchedule
  },
  {
    path: '/radio/:radio',
    name: 'radio',
    component: AppRadio
  },
  {
    path: '/now',
    name: 'now',
    component: AppNow
  },
  {
    path: '/',
    name: 'default',
    component: AppSchedule
  }
];

export default createRouter({
  history: createWebHashHistory(),
  routes
});
