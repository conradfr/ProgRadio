import 'es6-promise/auto';

import Vue from 'vue';
import VueGtag from 'vue-gtag';

import store from './store/store';
import router from './router/router';

Vue.config.productionTip = false;
// Vue.config.performance = true;

/* eslint-disable no-undef */
Vue.use(VueGtag, {
  config: { id: gtCode },
  disableScriptLoad: true
}, router);

/* eslint-disable no-new */
new Vue({
  router,
  store,
}).$mount('#app');
