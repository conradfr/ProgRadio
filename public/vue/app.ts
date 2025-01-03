import { createApp, markRaw } from 'vue';
import { createPinia } from 'pinia';

import VueGtag from 'vue-gtag';
import VueFlags from '@growthbunker/vueflags';

import App from './components/App.vue';
import router from './router/router';
import i18n from './lang/i18n';

const app = createApp(App);

app.use(i18n);
const pinia = createPinia();

/* eslint-disable no-param-reassign */
pinia.use(({ store }) => {
  store.$router = markRaw(router);
});

app.use(router);
app.use(pinia);

app.use(VueGtag, {
  // @ts-expect-error gtCode is defined on the global scope
  // eslint-disable-next-line no-undef
  config: { id: gtCode },
  disableScriptLoad: true
}, router);

app.use(VueFlags, {
  // Specify the path of the folder where the flags are stored.
  iconPath: '/img/flags/',
});

app.mount('#app');
