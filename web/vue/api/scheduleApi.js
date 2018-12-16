import axios from 'axios';

/* eslint-disable no-undef */
export default {
  getSchedule(dateStr) {
    return axios.get(`${baseUrl}schedule/${dateStr}`)
      .then((response) => {
        localStorage.setItem(dateStr, JSON.stringify(response.data.schedule));
        return response.data.schedule;
      });
  },
  hasCache(dateStr) {
    if (localStorage[dateStr]) {
      const cached = JSON.parse(localStorage.getItem(dateStr));
      if (!Array.isArray(cached) && typeof cached === 'object') {
        return true;
      }
    }

    return false;
  },
  getCache(dateStr) {
    return JSON.parse(localStorage.getItem(dateStr));
  }
};
