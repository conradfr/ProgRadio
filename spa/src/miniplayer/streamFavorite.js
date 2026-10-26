// Adapted from spa userStore

import cookies from '../utils/cookies.js';

import {
  COOKIE_RADIO_FAVORITES,
  COOKIE_STREAM_FAVORITES
} from '../config/config.js';

const getCookieList = key => cookies.get(key, '').split('|').filter(item => item !== '');

const setCookieList = (key, list) => cookies.set(key, list.join('|'));

const isFavorite = streamId => getCookieList(COOKIE_STREAM_FAVORITES).includes(streamId);

/* Logged: the server toggles the stream and its radio.
   Non-logged: the favorites are kept in cookies, the radio attached to the stream (if any) follows the stream. */
const toggle = async ({ streamId, radioCodeName, logged, loginUrl }, add) => {
  if (logged) {
    const response = await fetch(`/streams/favorite/${streamId}`);

    if (response.status === 403) {
      window.location.href = loginUrl;
    }

    return;
  }

  const streams = getCookieList(COOKIE_STREAM_FAVORITES).filter(id => id !== streamId);
  setCookieList(COOKIE_STREAM_FAVORITES, add ? [...streams, streamId] : streams);

  if (radioCodeName) {
    const radios = getCookieList(COOKIE_RADIO_FAVORITES).filter(codeName => codeName !== radioCodeName);
    setCookieList(COOKIE_RADIO_FAVORITES, add ? [...radios, radioCodeName] : radios);
  }
};

export default {
  isFavorite,
  toggle
};
