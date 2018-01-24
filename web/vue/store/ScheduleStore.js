import axios from 'axios';
const moment = require('moment-timezone');

import * as config from '../config/config.js';

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

    if (window.innerWidth > (hourPixels + (config.MINUTE_PIXEL * 30))) {
        reduceToHour = Math.abs(Math.floor(window.innerWidth / config.GRID_INDEX_BREAK));
    }
    else {
        const minutes = moment().tz(config.TIMEZONE).minute();
        if (minutes < 15) {
            reduceToHour = 0.25;
        }
        else if (minutes > 45) {
            reduceToHour = -0.5;
        }
    }

    return enforceScrollIndex((moment().tz(config.TIMEZONE).hours() - reduceToHour) * hourPixels + 1);
};

const ScheduleStore = {
    state: {
        radios: radios ,
        schedule: schedule,
        cursorTime: moment().tz(config.TIMEZONE),
        scrollIndex: initialScrollIndex(),
        scrollClick: false
    },
    getters: {
        cursorIndex: state => {
            const startDay = moment().tz(config.TIMEZONE).startOf('day');
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
            state.cursorTime = moment().tz(config.TIMEZONE);
        },
        scrollClickSet: (state, value) => {
            state.scrollClick = value;
        },
        updateSchedule: (state, value) => {
            state.schedule = value;
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
            const now = moment().tz(config.TIMEZONE);

            if (now.hour() === 0 && now.minutes() === 5) {
                axios.get(`${base_url}schedule`).then((response) => {
                    commit('updateSchedule', response.data.schedule);
                });
            }

            commit('updateCursor');
        }
    }
};

export default ScheduleStore;
