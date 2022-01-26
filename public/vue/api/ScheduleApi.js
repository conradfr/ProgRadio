import axios from 'axios';

import {
  CACHE_KEY_RADIOS,
  CACHE_KEY_COLLECTIONS,
  CACHE_KEY_CATEGORIES,
  LISTENING_SESSION_SOURCE
} from '../config/config';

import cache from '../utils/cache';

/* eslint-disable no-undef */

// ------------------------- API -------------------------

/* eslint-disable arrow-body-style */
const getSchedule = (dateStr, params) => {
  let url = `https://${apiUrl}/schedule/${dateStr}`;

  if (params !== undefined && params !== null) {
    if (params.collection !== undefined && params.collection !== null && params.collection !== '') {
      url += `?c=${params.collection}`;
    } else if (params.radio !== undefined && params.radio !== null && params.radio !== '') {
      url += `?r=${params.radio}`;
    } else if (params.radios !== undefined && params.radios !== null && params.radios.length > 0) {
      url += `?r=${params.radios.join(',')}`;
    }
  }
  return axios.get(url)
    .then((response) => {
      if (response.data.schedule !== undefined) {
        // only cache full data
        if (params === undefined || params === null) {
          cache.setCache(dateStr, response.data.schedule);
        }

        return response.data.schedule;
      }

      return [];
    })
    .catch(() => {
      return {};
    });
};

const getRadiosData = () => {
  /* eslint-disable no-undef */
  return axios.get(`https://${apiUrl}/radios`)
  // return axios.get('/radios')
    .then((response) => {
      if (response.data.radios !== undefined) {
        cache.setCache(CACHE_KEY_RADIOS, response.data.radios);
      }

      if (response.data.collections !== undefined) {
        cache.setCache(CACHE_KEY_COLLECTIONS, response.data.collections);
      }

      if (response.data.categories !== undefined) {
        cache.setCache(CACHE_KEY_CATEGORIES, response.data.categories);
      }

      return response.data;
    })
    .catch(() => {
      return {};
    });
};

const toggleFavoriteRadio = (radioCodeName) => {
  return axios.get(`/radios/favorite/${radioCodeName}`)
    .catch((error) => {
      if (error.response.status === 403) {
        window.location.href = '/fr/login';
      }
    });
};

const getAffiliate = (locale) => {
  return axios.get(`/${locale}/affiliate`)
    .then((response) => {
      return response.data;
    });
};

const sendListeningSession = (codeName, radioStreamCodeName,
  dateTimeStart, dateTimeEnd, id, ctrl) => {
  const data = {
    date_time_start: dateTimeStart.toISO(),
    date_time_end: dateTimeEnd.toISO(),
    source: LISTENING_SESSION_SOURCE,
    ctrl: Math.random()
  };

  if (radioStreamCodeName !== undefined && radioStreamCodeName !== null) {
    data.radio_stream_code_name = radioStreamCodeName;
  } else {
    data.stream_id = codeName;
  }

  if (id !== undefined && id !== null) {
    /* eslint-disable no-underscore-dangle */
    axios.put(`https://${apiUrl}/listening_session/${id}`, data)
      .then((response) => {
        // Api determined it was a new session instead of updating the current one
        if (response.data.id !== id) {
          document.getElementById('app')
            .__vue_app__.config.globalProperties.$store.dispatch('setListeningSession',
              { data: response.data, ctrl });
        }
      });
    return;
  }

  /* eslint-disable no-underscore-dangle */
  axios.post(`https://${apiUrl}/listening_session`, data)
    .then((response) => {
      document.getElementById('app')
        .__vue_app__.config.globalProperties.$store.dispatch('setListeningSessionId',
          { id: response.data.id, ctrl });
    });
};

/* eslint-disable no-undef */
export default {
  getSchedule,
  getRadiosData,
  toggleFavoriteRadio,
  getAffiliate,
  sendListeningSession
};
