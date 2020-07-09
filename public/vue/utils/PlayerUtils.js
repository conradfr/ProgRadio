import Vue from 'vue';
import findIndex from 'lodash/findIndex';
import filter from 'lodash/filter';
import * as config from '../config/config';

const moment = require('moment-timezone');

const VueCookie = require('vue-cookie');

Vue.use(VueCookie);

/* ---------- RADIOS ---------- */

const getNextRadio = (currentRadio, radios, way) => {
  if (currentRadio.type !== config.PLAYER_TYPE_RADIO) {
    return null;
  }

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

const buildNotificationData = (radio, show) => {
  const data = {
    name: radio.name,
    times: null,
    host: null,
    title: null,
  };

  if (show !== undefined && show !== null && show.picture_url !== null) {
    data.icon = `${config.THUMBNAIL_PROGRAM_PATH}${show.picture_url}`;
  } else if (radio.type === config.PLAYER_TYPE_RADIO) {
    data.icon = `/img/radio/schedule/${radio.code_name}.png`;
  } else if (radio.img !== null && radio.img !== '') {
    data.icon = `${config.THUMBNAIL_STREAM_PATH}${radio.img}`;
  } else {
    data.icon = '/img/stream-placeholder.png';
  }

  if (show !== undefined && show !== null) {
    const format = 'HH[h]mm';
    const start = moment(show.start_at).tz(config.TIMEZONE).format(format);
    const end = moment(show.end_at).tz(config.TIMEZONE).format(format);

    data.times = `${start}-${end}`;
    data.host = show.host !== null ? show.host : null;
    data.title = show.title;
  }

  return data;
};

const buildMediaSessionMetadata = (data) => {
  // we update the MediaSession metadata if supported
  if (navigator.mediaSession !== undefined) {
    let title = '';

    if (data.host !== null) {
      title = `${data.host} - `;
    }

    if (data.times !== null) {
      title += data.times;
    }

    /* eslint-disable no-undef */
    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist: data.name,
      album: data.title,
      artwork: [
        { src: data.icon, type: 'image/jpeg' },
      ]
    });
  }
};

const buildNotification = (data) => {
  const options = {
    lang: 'fr',
    tag: config.PLAYER_NOTIFICATION_ID,
    icon: data.icon
  };

  options.body = '';
  if (data.host !== null) {
    options.body = `${data.host} - `;
  }

  if (data.times !== null) {
    options.body += data.times;
  }

  let text = data.name;
  if (data.title !== null) {
    text += ` - ${data.title}`;
  }

  const notification = new Notification(text, options);
  notification.onshow = () => {
    setTimeout(notification.close.bind(notification), config.PLAYER_NOTIFICATION_LENGTH);
  };
};

const showNotification = (radio, show) => {
  if (!('Notification' in window)) {
    return;
  }

  const data = buildNotificationData(radio, show);
  buildMediaSessionMetadata(data);

  const isMobile = window.matchMedia('only screen and (max-width: 1365px)');
  if (isMobile.matches) {
    return;
  }

  if (Notification.permission === 'granted') {
    buildNotification(data);
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission((permission) => {
      if (!('permission' in Notification)) {
        Notification.permission = permission;
      }

      if (permission === 'granted') {
        buildNotification(data);
      }
    });
  }
};

export default {
  getNextRadio,
  showNotification
};
