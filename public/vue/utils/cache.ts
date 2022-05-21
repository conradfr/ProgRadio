// http://crocodillon.com/blog/always-catch-localstorage-security-and-quota-exceeded-errors
const isLocalStorageFull = (e: any) => {
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

const isLocalStorageEnabled = (): boolean => {
  try {
    return localStorage !== undefined;
  } catch (e) {
    return false;
  }
};

const hasCache = (key: string): boolean => {
  if (isLocalStorageEnabled() && localStorage[key] !== undefined) {
    try {
      // @ts-ignore
      const cached = JSON.parse(localStorage.getItem(key));
      if (Array.isArray(cached) || typeof cached === 'object') {
        return true;
      }
    } catch (e) {
      return false;
    }
  }

  return false;
};

const getCache = (key: string) => JSON.parse(localStorage.getItem(key)!);

const setCache = (key: string, data: any, retry = true) => {
  if (!isLocalStorageEnabled()) {
    return;
  }

  localStorage.removeItem(key);

  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    if (retry) {
      if (isLocalStorageFull(e)) {
        localStorage.clear();
        setCache(key, data, false);
      }
    }
  }
};

export default {
  hasCache,
  getCache,
  setCache
};
