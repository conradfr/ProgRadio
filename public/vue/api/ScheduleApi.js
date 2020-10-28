import axios from 'axios';

import { CACHE_KEY_RADIOS, CACHE_KEY_COLLECTIONS, CACHE_KEY_CATEGORIES } from '../config/config';

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

const hasCache = (key) => {
  if (localStorage !== null && localStorage[key] !== undefined) {
    const cached = JSON.parse(localStorage.getItem(key));
    if (!Array.isArray(cached) && typeof cached === 'object') {
      return true;
    }
  }

  return false;
};

const getCache = key => JSON.parse(localStorage.getItem(key));

const setCache = (key, data) => {
  if (localStorage === null) {
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

/* todo fix baseUrl */
/* eslint-disable arrow-body-style */
const getSchedule = (dateStr, baseUrl) => {
  return axios.get(`${baseUrl}schedule/${dateStr}`)
    .then((response) => {
      if (response.data.schedule !== undefined) {
        setCache(dateStr, response.data.schedule);
        return response.data.schedule;
      }

      return [];
    });
};

const getRadiosData = (baseUrl) => {
  return axios.get(`${baseUrl}radios`)
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
    });
};

const toggleFavoriteRadio = (radioCodeName, baseUrl) => {
  axios.get(`${baseUrl}radios/favorite/${radioCodeName}`)
    .catch((error) => {
      if (error.response.status === 403) {
        window.location.href = `${baseUrl}login`;
      }
    });
};

/* eslint-disable no-undef */
export default {
  getSchedule,
  getRadiosData,
  hasCache,
  getCache,
  toggleFavoriteRadio
};
