import findIndex from 'lodash/findIndex';
import filter from 'lodash/filter';

import { DateTime } from 'luxon';

import * as config from '../config/config';
import ScheduleApi from '../api/ScheduleApi';
import ScheduleUtils from './ScheduleUtils';

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

/* There is a bug as it loops on one page only
  @todo fix
 */
const getNextStream = (currentStream, streams, way) => {
  if (currentStream.type !== config.PLAYER_TYPE_STREAM) {
    return null;
  }

  const currentIndex = findIndex(streams, s => s.code_name === currentStream.code_name);

  if (currentIndex === -1) {
    return streams[0];
  }

  let newIndex = 0;
  if (way === 'backward') {
    newIndex = currentIndex === 0 ? streams.length - 1
      : currentIndex - 1;
  } else if (way === 'forward') {
    newIndex = streams.length === (currentIndex + 1) ? 0
      : currentIndex + 1;
  }

  return streams[newIndex];
};

/* ---------- NOTIFICATION ---------- */

const buildNotificationData = (radio, streamCodeName, show) => {
  const data = {
    name: radio.name,
    times: null,
    host: null,
    title: null,
  };

  const stream = ScheduleUtils.getStreamFromCodeName(streamCodeName, radio);

  if (stream !== null) {
    data.name = stream.name;
  }

  data.icon = getPictureUrl(radio, show);

  if (show !== undefined && show !== null) {
    const start = DateTime.fromISO(show.start_at).setZone(config.TIMEZONE)
      .toLocaleString(DateTime.TIME_SIMPLE);
    const end = DateTime.fromISO(show.end_at).setZone(config.TIMEZONE)
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

const showNotification = (radio, streamCodeName, show) => {
  if (!('Notification' in window)) {
    return;
  }

  const data = buildNotificationData(radio, streamCodeName, show);
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

const sendListeningSession = (externalPlayer, playing, radio, radioStreamCodeName,
  session) => {
  if (externalPlayer === true) {
    return;
  }
  if (playing === true && session.start !== null) {
    const dateTimeEnd = DateTime.local().setZone(config.TIMEZONE);

    if (dateTimeEnd.diff(session.start).as('seconds') < config.LISTENING_SESSION_MIN_SECONDS) {
      return;
    }

    setTimeout(
      () => {
        ScheduleApi.sendListeningSession(radio.code_name, radioStreamCodeName,
          session.start, dateTimeEnd, session.id, session.ctrl);
      },
      1000
    );
  }
};

export default {
  getPictureUrl,
  getNextRadio,
  getNextStream,
  showNotification,
  sendListeningSession
};
