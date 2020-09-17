import Vue from 'vue';
import VueRouter from 'vue-router';

import App from '../components/App.vue';
import AppSchedule from '../components/AppSchedule.vue';
import AppStreams from '../components/AppStreams.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    component: App,
    children: [
      {
        path: 'streaming',
        name: 'streaming_home',
        component: AppStreams
      },
      {
        path: 'streaming/:countryOrCategory?',
        name: 'streaming',
        component: AppStreams
      },
      {
        path: 'schedule',
        name: 'schedule_home',
        component: AppSchedule
      },
      {
        path: 'schedule/:collection?',
        name: 'schedule',
        component: AppSchedule
      },
      {
        path: '*',
        name: 'default',
        component: AppSchedule
      }
    ]
  }
];

const router = new VueRouter({
  routes
});

export default router;
