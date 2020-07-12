import Vue from 'vue';
import Vuex from 'vuex';

import ScheduleStore from './ScheduleStore';
import PlayerStore from './PlayerStore';
import StreamsStore from './StreamsStore';

Vue.use(Vuex);

const store = new Vuex.Store({
  // strict: process.env.NODE_ENV !== 'production',
  state: {
    // based on an increment to allow concurrent ajax requests and a unified display indicator
    loading: 0
  },
  getters: {
    isLoading: state => state.loading > 0
  },
  mutations: {
    setLoading: (state, value) => {
      const incrValue = value === true ? 1 : -1;
      let newStateValue = state.loading + incrValue;
      // sometimes actions do not set loading as true but always set false once completed.
      if (newStateValue < 0) {
        newStateValue = 0;
      }

      Vue.set(state, 'loading', newStateValue);
    }
  },
  modules: {
    schedule: ScheduleStore,
    player: PlayerStore,
    streams: StreamsStore
  }
});

export default store;
