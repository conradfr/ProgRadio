import { createApp, markRaw } from 'vue';
import { createPinia } from 'pinia';

import VueGtag from 'vue-gtag';

import App from './components/App.vue';
import VueFlag from './components/Utils/VueFlag.vue';
import router from './router/router.ts';
import i18n, { loadLocale } from './lang/i18n';

// the messages of the current locale are a separate chunk: requested first, awaited before mounting.
// If it fails english (fallback) is displayed
// @ts-expect-error locale is defined on the global scope
// eslint-disable-next-line no-undef
const localeLoaded = loadLocale(locale).catch(() => {});

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

// used as <vue-flag> in the templates
app.component('VueFlag', VueFlag);

localeLoaded.then(() => app.mount('#app'));
