import 'es6-promise/auto';

import Vue from 'vue';

import store from './store/store';
import router from './router/router';
import App from './components/App.vue';

Vue.config.productionTip = false;
// Vue.config.performance = true;

/* eslint-disable no-new */
/*
new Vue({
  router,
  store,
}).$mount('#app');
*/

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
});
