import Vue from 'vue';
import find from 'lodash/find';
import findIndex from 'lodash/findIndex';
import filter from 'lodash/filter';
import * as config from '../config/config';


const moment = require('moment-timezone');

const VueCookie = require('vue-cookie');

Vue.use(VueCookie);

/* ---------- RADIOS ---------- */

/* eslint-disable no-undef */
const initRadioState = () => {
  if (radios && Vue.cookie.get(config.COOKIE_LAST_RADIO_PLAYED)) {
    const radio = find(radios, { code_name: Vue.cookie.get(config.COOKIE_LAST_RADIO_PLAYED) });
    if (radio !== undefined) {
      return radio;
    }
  }

  return null;
};

const getNextRadio = (currentRadio, radios, way) => {
  // remove radios without streaming
  const radiosFiltered = filter(radios, r => r.streaming_enabled === true);

  if (radiosFiltered.length === 0) { return currentRadio; }
  if (radiosFiltered.length === 1) { return radiosFiltered[0]; }

  const currentIndex = findIndex(radiosFiltered, r => r.code_name === currentRadio.code_name);

  if (currentIndex === -1) {
    return radios[0];
  }

  let newIndex = 0;
  if (way === 'backward') {
    newIndex = currentIndex === 0 ? radiosFiltered.length - 1
      : currentIndex - 1;
  } else if (way === 'forward') {
    newIndex = radiosFiltered.length === (currentIndex + 1) ? 0
      : currentIndex + 1;
  }

  return radiosFiltered[newIndex];
};

/* ---------- NOTIFICATION ---------- */

const buildNotification = (radio, show) => {
  let icon = '';
  if (show !== null && show.picture_url !== null) {
    icon = `${config.THUMBNAIL_PATH}${show.picture_url}`;
  } else {
    icon = `/img/radio/schedule/${radio.code_name}.png`;
  }

  const options = {
    lang: 'fr',
    tag: config.PLAYER_NOTIFICATION_ID,
    icon
  };

  let text = '';

  if (show !== null) {
    const format = 'HH[h]mm';
    const start = moment(show.start_at).tz(config.TIMEZONE).format(format);
    const end = moment(show.end_at).tz(config.TIMEZONE).format(format);

    options.body = show.host !== null ? `${show.host} - ` : '';
    options.body += `${start}-${end}`;
    text += `${show.title} - `;
  }

  // We also update the mediasession metadata if supported
  if (navigator.mediaSession !== undefined) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: text,
      artist: radio.name,
      album: show !== null && show.host !== null ? show.host : null,
      artwork: [
        { src: icon, type: 'image/jpeg' },
      ]
    });
  }

  text += radio.name;

  const notification = new Notification(text, options);
  notification.onshow = () => {
    setTimeout(notification.close.bind(notification), config.PLAYER_NOTIFICATION_LENGTH);
  };
};

const showNotification = (radio, show) => {
  if (!('Notification' in window)) {
    return;
  }

  const isMobile = window.matchMedia('only screen and (max-width: 1365px)');
  if (isMobile.matches) {
    return;
  }

  if (Notification.permission === 'granted') {
    buildNotification(radio, show);
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission((permission) => {
      if (!('permission' in Notification)) {
        Notification.permission = permission;
      }

      if (permission === 'granted') {
        buildNotification(radio, show);
      }
    });
  }
};

export default {
  initRadioState,
  getNextRadio,
  showNotification
};
