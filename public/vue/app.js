import 'es6-promise/auto';

import { createApp } from 'vue';
import VueGtag from 'vue-gtag';
import VueFlags from '@growthbunker/vueflags';
// import VueToast from 'vue-toast-notification';

import store from './store/store';
import router from './router/router';
import i18n from './lang/i18n';

import App from './components/App.vue';

const app = createApp(App);

app.use(i18n);
app.use(router);
app.use(store);

// app.use(VueToast);
/* eslint-disable no-undef */
app.use(VueGtag, {
  config: { id: gtCode }
});
app.use(VueFlags, {
  // Specify the path of the folder where the flags are stored.
  iconPath: '/img/flags/',
});

app.mount('#app');
