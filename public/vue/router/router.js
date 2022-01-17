import {
  // createWebHashHistory,
  createWebHistory,
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
    path: '/:lang/streaming',
    name: 'streaming_home',
    component: AppStreams
  },
  {
    path: '/:lang/streaming/:countryOrCategoryOrUuid?',
    name: 'streaming',
    component: AppStreams
  },
  {
    path: '/:lang/schedule',
    name: 'schedule_home',
    component: AppSchedule
  },
  {
    path: '/:lang/schedule/:collection?',
    name: 'schedule',
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
    path: '/:lang/',
    name: 'default',
    component: AppSchedule
  }
];

export default createRouter({
  history: createWebHistory(),
  routes
});
