import axios from 'axios';

import {
  CACHE_KEY_RADIOS,
  CACHE_KEY_COLLECTIONS,
  CACHE_KEY_CATEGORIES,
  LISTENING_SESSION_SOURCE
} from '../config/config';

// ------------------------- Cache -------------------------

// http://crocodillon.com/blog/always-catch-localstorage-security-and-quota-exceeded-errors
const isLocalStorageFull = (e) => {
  let quotaExceeded = false;
  if (e) {
    if (e.code) {
      switch (e.code) {
        case 22:
          quotaExceeded = true;
          break;
        case 1014:
          // Firefox
          if (e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
            quotaExceeded = true;
          }
          break;
        default:
          // nothing
      }
    } else if (e.number === -2147024882) {
      // Internet Explorer 8
      quotaExceeded = true;
    }
  }
  return quotaExceeded;
};

const isLocalStorageEnabled = () => {
  try {
    return localStorage !== undefined;
  } catch (e) {
    return false;
  }
};

const hasCache = (key) => {
  if (isLocalStorageEnabled() && localStorage[key] !== undefined) {
    const cached = JSON.parse(localStorage.getItem(key));
    if (Array.isArray(cached) || typeof cached === 'object') {
      return true;
    }
  }

  return false;
};

const getCache = key => JSON.parse(localStorage.getItem(key));

const setCache = (key, data) => {
  if (isLocalStorageEnabled() === false) {
    return;
  }

  localStorage.removeItem(key);

  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    if (isLocalStorageFull(e)) {
      localStorage.clear();
      setCache(key, data);
    }
  }
};

// ------------------------- API -------------------------

/* eslint-disable arrow-body-style */
const getSchedule = (dateStr, params) => {
  let url = `/schedule/${dateStr}`;

  if (params !== undefined && params !== null) {
    if (params.collection !== undefined) {
      url += `?collection=${params.collection}`;
    } else if (params.radio !== undefined) {
      url += `?radio=${params.radio}`;
    }
  }
  return axios.get(url)
    .then((response) => {
      if (response.data.schedule !== undefined) {
        // only cache full data
        if (params === undefined || params === null) {
          setCache(dateStr, response.data.schedule);
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
  return axios.get('/radios')
    .then((response) => {
      if (response.data.radios !== undefined) {
        setCache(CACHE_KEY_RADIOS, response.data.radios);
      }

      if (response.data.radios !== undefined) {
        setCache(CACHE_KEY_COLLECTIONS, response.data.collections);
      }

      if (response.data.radios !== undefined) {
        setCache(CACHE_KEY_CATEGORIES, response.data.categories);
      }

      return response.data;
    })
    .catch(() => {
      return {};
    });
};

const toggleFavoriteRadio = (radioCodeName) => {
  axios.get(`/radios/favorite/${radioCodeName}`)
    .catch((error) => {
      if (error.response.status === 403) {
        window.location.href = '/fr/login';
      }
    });
};

const sendListeningSession = (codeName, dateTimeStart, dateTimeEnd) => {
  const data = {
    id: codeName,
    date_time_start: dateTimeStart.toISO(),
    date_time_end: dateTimeEnd.toISO(),
    source: LISTENING_SESSION_SOURCE
  };

  axios.post('/listen', data);
};

/* eslint-disable no-undef */
export default {
  getSchedule,
  getRadiosData,
  hasCache,
  getCache,
  toggleFavoriteRadio,
  sendListeningSession
};
