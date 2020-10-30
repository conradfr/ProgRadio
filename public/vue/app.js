import 'es6-promise/auto';

import Vue from 'vue';
import VueGtag from 'vue-gtag';

import store from './store/store';
import router from './router/router';
import i18n from './lang/i18n';

Vue.config.productionTip = false;
// Vue.config.performance = true;

/* eslint-disable no-undef */
Vue.use(VueGtag, {
  config: { id: gtCode },
  disableScriptLoad: true
}, router);

/* eslint-disable no-new */
new Vue({
  i18n,
  router,
  store,

}).$mount('#app');
