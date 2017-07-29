import Vue from 'vue';

import store from './store/store';
import App from './components/App.vue'

new Vue({
    el: '#app',
    store,
    render: h => h(App)
});
