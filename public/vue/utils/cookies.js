import { COOKIE_PARAMS } from '../config/config';

const has = (key) => {
  if (document.cookie.split(';').some(item => item.trim().startsWith(`${key}=`))) {
    return true;
  }

  return false;
};

const remove = (key) => {
  document.cookie = `${key}=;path=${COOKIE_PARAMS.path};SameSite=${COOKIE_PARAMS.SameSite};secure=true;expires=Thu, 01 Jan 1970 00:00:01 GMT`;
};

const get = (key, defaultValue) => {
  if (!has(key)) {
    return defaultValue || null;
  }

  return document.cookie
    .split('; ')
    .find(row => row.startsWith(`${key}=`))
    .split('=')[1];
};

const getJson = (key, defaultValue) => {
  const cookie = get(key, defaultValue);

  if (cookie !== null && cookie !== defaultValue) {
    let value = null;
    try {
      value = JSON.parse(cookie);
    } catch (error) {
      // console.warn(error);
    }

    return value;
  }

  return cookie;
};

const set = (key, data, options) => {
  let opts = COOKIE_PARAMS;
  if (options !== undefined && options !== null) {
    opts = Object.assign(COOKIE_PARAMS, options);
  }

  opts = Object.keys(opts).map(k => `;${k}=${opts[k]}`).join('');
  const dataString = typeof data === 'object' ? JSON.stringify(data) : data;

  document.cookie = `${key}=${dataString}${opts}`;
};

export default {
  has,
  get,
  getJson,
  set,
  remove
};
