import remove from 'lodash/remove';

import { createStore } from 'vuex';

import ScheduleStore from './ScheduleStore';
import PlayerStore from './PlayerStore';
import StreamsStore from './StreamsStore';
import UserStore from './UserStore';

import { TOAST_TYPE_ERROR, TOAST_DURATION } from '../config/config';

const store = createStore({
  // strict: process.env.NODE_ENV !== 'production',
  state: {
    // based on an increment to allow concurrent ajax requests and a unified display indicator
    loading: 0,
    toasts: []
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
    toast: ({ commit }, { message, type }) => {
      const toast = {
        message,
        id: `t${Date.now()}-${Math.floor(Math.random() * 100)}`,
        type: type || TOAST_TYPE_ERROR,
        duration: TOAST_DURATION
      };

      commit('addToast', toast);
    },
    toastConsumed: ({ commit }, id) => {
      commit('removeToast', id);
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

      state.loading = newStateValue;
    },
    addToast: (state, toast) => {
      state.toasts.push(toast);
    },
    removeToast: (state, id) => {
      state.toast = remove(state.toasts, t => t.id === id);
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
