import axios from 'axios';

/* eslint-disable no-undef */
export default {
  getSchedule() {
    return axios.get(`${baseUrl}schedule`).then(response => response.data.schedule);
  }
};
