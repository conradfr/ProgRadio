import { createApp, markRaw } from 'vue';
import { createPinia } from 'pinia';

import VueGtag from 'vue-gtag';
import VueFlags from '@growthbunker/vueflags';

import App from './components/App.vue';
import router from './router/router.ts';
import i18n from './lang/i18n';

const app = createApp(App);

// @ts-expect-error defined on global scope
// eslint-disable-next-line no-undef
app.config.globalProperties.$CDN_BASE_URL = cdnBaseUrl;

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
  // @ts-expect-error defined on global scope
  // eslint-disable-next-line no-undef
  iconPath: `${cdnBaseUrl}img/flags/`,
});

app.mount('#app');
