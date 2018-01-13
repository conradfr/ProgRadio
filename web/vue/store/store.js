import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

import ScheduleStore from './ScheduleStore'
import PlayerStore from './PlayerStore'

const store = new Vuex.Store({
    modules: {
        schedule: ScheduleStore,
        player: PlayerStore
    }
});

export default store;
