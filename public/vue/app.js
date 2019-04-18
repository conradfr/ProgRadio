import 'es6-promise/auto';

import Vue from 'vue';

import store from './store/store';
import App from './components/App.vue';

Vue.config.productionTip = false;
// Vue.config.performance = true;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  render: h => h(App)
});
