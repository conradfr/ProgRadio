// import 'es6-promise/auto';

import { createApp } from 'vue';
import VueGtag from 'vue-gtag';
import VueFlags from '@growthbunker/vueflags';

import store from './store/store';
import router from './router/router';
import i18n from './lang/i18n';

import App from './components/App.vue';

const app = createApp(App);

app.use(i18n);
app.use(router);
app.use(store);

/* eslint-disable no-undef */
app.use(VueGtag, {
  config: { id: gtCode },
  disableScriptLoad: true
}, router);
app.use(VueFlags, {
  // Specify the path of the folder where the flags are stored.
  iconPath: '/img/flags/',
});

app.mount('#app');
