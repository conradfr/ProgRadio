import { COOKIE_PARAMS } from '@/config/config';

const has = (key: string) => {
  // @ts-ignore
  if (document.cookie.split(';').some((item: unknown) => item?.trim().startsWith(`${key}=`))) {
    return true;
  }

  return false;
};

const remove = (key: string) => {
  /* eslint-disable max-len */
  document.cookie = `${key}=;path=${COOKIE_PARAMS.path};SameSite=${COOKIE_PARAMS.SameSite};secure=true;expires=Thu, 01 Jan 1970 00:00:01 GMT`;
};

const get = (key: string, defaultValue: any = null) => {
  if (!has(key)) {
    return defaultValue;
  }

  // @ts-ignore
  return document.cookie
    .split('; ')
    // @ts-ignore
    .find((row: unknown) => row.startsWith(`${key}=`))
    .split('=')[1];
};

const getJson = (key: string, defaultValue: any = null): any => {
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

const set = (key: string, data: any, options?: object) => {
  let opts = COOKIE_PARAMS;
  if (options !== undefined && options !== null) {
    opts = Object.assign(COOKIE_PARAMS, options);
  }

  // @ts-ignore
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
