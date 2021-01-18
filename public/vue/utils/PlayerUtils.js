import Vue from 'vue';
import findIndex from 'lodash/findIndex';
import filter from 'lodash/filter';

import { DateTime } from 'luxon';

import * as config from '../config/config';
import ScheduleApi from '../api/ScheduleApi';

const VueCookie = require('vue-cookie');

Vue.use(VueCookie);

/* ---------- RADIOS ---------- */

const getPictureUrl = (radio, show) => {
  if (show !== undefined && show !== null && show.picture_url !== null) {
    return `${config.THUMBNAIL_NOTIFICATION_PROGRAM_PATH}${show.picture_url}`;
  }

  if (radio.type === config.PLAYER_TYPE_RADIO) {
    return `/img/radio/schedule/${radio.code_name}.png`;
  }

  if (radio.img !== null && radio.img !== '') {
    return `${config.THUMBNAIL_STREAM_PATH}${radio.img}`;
  }

  return '/img/stream-placeholder.png';
};

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

  data.icon = getPictureUrl(radio, show);

  if (show !== undefined && show !== null) {
    const start = DateTime.fromSQL(show.start_at).setZone(config.TIMEZONE)
      .toLocaleString(DateTime.TIME_SIMPLE);
    const end = DateTime.fromSQL(show.end_at).setZone(config.TIMEZONE)
      .toLocaleString(DateTime.TIME_SIMPLE);

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

/* ---------- API ---------- */

const sendListeningSession = (externalPlayer, playing, radio, dateTimeStart) => {
  if (externalPlayer === true) {
    return;
  }

  if (playing === true && dateTimeStart !== null) {
    const dateTimeEnd = DateTime.local().setZone(config.TIMEZONE);

    if (dateTimeEnd.diff(dateTimeStart).as('seconds') < config.LISTENING_SESSION_MIN_SECONDS) {
      return;
    }

    setTimeout(
      () => {
        ScheduleApi.sendListeningSession(radio.code_name, dateTimeStart, dateTimeEnd);
      },
      500
    );
  }
};

export default {
  getPictureUrl,
  getNextRadio,
  showNotification,
  sendListeningSession
};
