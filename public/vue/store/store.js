import Vue from 'vue';
import Vuex from 'vuex';

import ScheduleStore from './ScheduleStore';
import PlayerStore from './PlayerStore';

Vue.use(Vuex);

const store = new Vuex.Store({
  // strict: process.env.NODE_ENV !== 'production',
  modules: {
    schedule: ScheduleStore,
    player: PlayerStore
  }
});

export default store;
