import Vue from 'vue';
import Vuex from 'vuex';

import ScheduleStore from './ScheduleStore';
import PlayerStore from './PlayerStore';
import StreamsStore from './StreamsStore';

Vue.use(Vuex);

const store = new Vuex.Store({
  // strict: process.env.NODE_ENV !== 'production',
  state: {
    loading: false
  },
  mutations: {
    setLoading: (state, value) => {
      Vue.set(state, 'loading', value);
    }
  },
  modules: {
    schedule: ScheduleStore,
    player: PlayerStore,
    streams: StreamsStore
  }
});

export default store;
