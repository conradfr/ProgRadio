import axios from 'axios';

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

const hasCache = (dateStr) => {
  if (localStorage[dateStr]) {
    const cached = JSON.parse(localStorage.getItem(dateStr));
    if (!Array.isArray(cached) && typeof cached === 'object') {
      return true;
    }
  }

  return false;
};

const getCache = dateStr => JSON.parse(localStorage.getItem(dateStr));

const setCache = (dateStr, data) => {
  localStorage.removeItem(dateStr);

  try {
    localStorage.setItem(dateStr, JSON.stringify(data));
  } catch (e) {
    if (isLocalStorageFull(e)) {
      localStorage.clear();
      setCache(dateStr, data);
    }
  }
};

/* todo fix baseUrl */
/* eslint-disable arrow-body-style */
const getSchedule = (dateStr, baseUrl) => {
  return axios.get(`${baseUrl}schedule/${dateStr}`)
    .then((response) => {
      setCache(dateStr, response.data.schedule);
      return response.data.schedule;
    });
};

/* eslint-disable no-undef */
export default {
  getSchedule,
  hasCache,
  getCache
};
