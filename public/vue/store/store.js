import Vue from 'vue';
import Vuex from 'vuex';
import VueToast from 'vue-toast-notification';

import ScheduleStore from './ScheduleStore';
import PlayerStore from './PlayerStore';
import StreamsStore from './StreamsStore';
import UserStore from './UserStore';

import { TOAST_TYPE_ERROR, TOAST_POSITION, TOAST_DURATION } from '../config/config';

Vue.use(Vuex);
Vue.use(VueToast);

const store = new Vuex.Store({
  // strict: process.env.NODE_ENV !== 'production',
  state: {
    // based on an increment to allow concurrent ajax requests and a unified display indicator
    loading: 0
  },
  getters: {
    isLoading: state => state.loading > 0
  },
  actions: {
    toggleFavorite: ({ dispatch }, radio) => {
      if (radio.type === 'radio') {
        dispatch('toggleRadioFavorite', radio.code_name, { root: true });
      } else {
        dispatch('toggleStreamFavorite', radio.code_name, { root: true });
      }
    },
    sendList: ({ dispatch }, radio) => {
      if (radio.type === 'radio') {
        dispatch('sendRadiosList', radio.code_name, { root: true });
      } else {
        dispatch('sendStreamsList', radio.code_name, { root: true });
      }
    },
    /* eslint-disable no-empty-pattern */
    toast: ({}, { message, type }) => {
      Vue.$toast.open({
        message,
        type: type || TOAST_TYPE_ERROR,
        duration: TOAST_DURATION,
        position: TOAST_POSITION
      });
    }
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
    streams: StreamsStore,
    user: UserStore
  }
});

export default store;
