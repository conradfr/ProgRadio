import Vue from 'vue';
import Vuex from 'vuex';
const moment = require('moment');

import * as config from '../config/config.js';

Vue.use(Vuex);

const enforceScrollIndex = (scrollIndex) => {
    if (scrollIndex < 0) { scrollIndex = 0; }
    else {
        const maxScroll = (config.MINUTE_PIXEL * 1440 * config.DAYS) - (window.innerWidth - 71) + config.GRID_VIEW_EXTRA;
        if (scrollIndex >= maxScroll) {
            scrollIndex = maxScroll;
        }
    }

    return scrollIndex;
};

const initialScrollIndex = () => {
    const hourPixels = config.MINUTE_PIXEL * 60;
    let reduceToHour = 0;

    if (window.innerWidth > hourPixels) {
        reduceToHour = Math.abs(Math.floor(window.innerWidth / config.GRID_INDEX_BREAK));
    }
    else if (moment().minute() > 45) {
        reduceToHour = 0.5;
    }

    return enforceScrollIndex((moment().hours() - reduceToHour) * hourPixels + 1);
};

const store = new Vuex.Store({
    state: {
        radios: radios ,
        schedule: schedule,
        cursorTime: moment(),
        scrollIndex: initialScrollIndex(),
        scrollClick: false
    },
    getters: {
        cursorIndex: state => {
            const startDay = moment().startOf('day');
            const newIndex = state.cursorTime.diff(startDay, 'minutes') * config.MINUTE_PIXEL + 1;
            return `${newIndex}px`;
        },
        gridIndex: state => {
            return {left: `-${state.scrollIndex}px`};
        },
        // sort by share, desc
        radiosRanked: state => {
            return  state.radios.sort(function(a, b) {
                if (a.share < b.share) {
                    return 1;
                }
                if (a.share > b.share) {
                    return -1;
                }
                // must be equal
                return 0;
            });
        }
    },
    mutations: {
        scrollSet(state, x) {
            state.scrollIndex = x;
        },
        scrollTo (state, x) {
            const newIndex = state.scrollIndex + x;
             state.scrollIndex = enforceScrollIndex(newIndex);
        },
        updateCursor(state) {
            state.cursorTime = moment();
        },
        scrollClickSet: (state, value) => {
            state.scrollClick = value;
        }
    },
    actions: {
        scrollToCursor: ({commit}) => {
            commit('scrollSet', initialScrollIndex());
        },
        scroll: ({commit}, x) => {
            commit('scrollTo', x);
        },
        scrollBackward: ({commit}) => {
            commit('scrollTo', (-1 * config.NAV_MOVE_BY));
        },
        scrollForward: ({commit}) => {
            commit('scrollTo', config.NAV_MOVE_BY);
        },
        scrollClick: ({commit}, value) => {
            commit('scrollClickSet', value)
        },
        tick: ({commit}) => {
            commit('updateCursor');
        }
    }
});

export default store;
