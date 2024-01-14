import findIndex from 'lodash/findIndex';
import filter from 'lodash/filter';

import { DateTime } from 'luxon';

import type { Radio } from '@/types/radio';
import type { Program } from '@/types/program';
import type { Stream } from '@/types/stream';
import type { Song } from '@/types/song';
import type { ListeningSession } from '@/types/listening_session';
import type { PlayOptions } from '@/types/play_options';
import PlayerStatus from '@/types/player_status';

import * as config from '../config/config';
import typeUtils from './typeUtils';
import ScheduleApi from '../api/ScheduleApi';
import ScheduleUtils from './ScheduleUtils';
import cookies from './cookies';

type NotificationData = {
  name: string
  icon: string
  times: string|null
  host: string|null
  title: string|null
};

/* ---------- RADIOS ---------- */

const getPictureUrl = (radio: Radio|Stream, show: Program|null = null) => {
  if (show !== null && show.picture_url !== null) {
    return `${config.THUMBNAIL_NOTIFICATION_PROGRAM_PATH}${show.picture_url}`;
  }

  if (typeUtils.isRadio(radio)) {
    return `/img/radio/schedule/${radio.code_name}.png`;
  }

  if (radio.img !== null && radio.img !== '') {
    return `${config.THUMBNAIL_STREAM_PATH}${radio.img}`;
  }

  return '/img/stream-placeholder.png';
};

const getNextRadio = (currentRadio: Radio|Stream, radios: Radio[], way: 'backward'|'forward') => {
  if (!typeUtils.isRadio(currentRadio)) {
    return null;
  }

  // remove radios without streaming
  const radiosFiltered = filter(radios, r => r.streaming_enabled);

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
const getNextStream = (currentStream: Stream, streams: Stream[], way: 'backward'|'forward') => {
  if (!typeUtils.isStream(currentStream)) {
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

const getStreamUrl = (radio: Radio|Stream, radioStreamCodeName: string|null) => {
  if (typeUtils.isRadio(radio) && !radio.streaming_enabled) {
    return null;
  }

  if (typeUtils.isStream(radio) || radioStreamCodeName === null) {
    return radio.stream_url;
  }

  if (Object.keys(radio.streams!).length > 0
    && Object.prototype.hasOwnProperty.call(radio.streams!, radioStreamCodeName)) {
    return radio.streams![radioStreamCodeName].url;
  }

  return null;
};

const getChannelName = (radio: Radio|Stream, radioStreamCodeName: string|null): string => {
  if (typeUtils.isRadio(radio) && (!radioStreamCodeName || !radio.streaming_enabled)) {
    return '';
  }

  // @ts-ignore
  if ((radioStreamCodeName && typeUtils.isRadio(radio)
      && Object.keys(radio.streams).length > 0
      && Object.prototype.hasOwnProperty.call(radio.streams!, radioStreamCodeName)
      && radio.streams![radioStreamCodeName].current_song)
    || (typeUtils.isStream(radio) && radio.current_song)) {
    const channelNameEnd = typeUtils.isRadio(radio)
      ? radioStreamCodeName : radio.radio_stream_code_name;
    return `song:${channelNameEnd}`;
  }

  return `url:${getStreamUrl(radio, radioStreamCodeName)}`;
};

const formatSong = (songData: Song): string|null => {
  if ((songData.artist === undefined || songData.artist === null
    || songData.artist === '')
    && (songData.title === undefined || songData.title === null
      || songData.title === '')) {
    return null;
  }

  let song = '';
  let hasArtist = false;
  if (songData.artist !== undefined && songData.artist !== null
    && songData.artist !== '') {
    song += songData.artist;
    hasArtist = true;
  }

  if (songData.title !== undefined && songData.title !== null
    && songData.title !== '') {
    if (hasArtist) {
      song += ' - ';
    }

    song += songData.title;
  }

  return song === '' ? null : song;
};

const extractTopicName = (fullTopicName: string): string|null => {
  if (!fullTopicName.startsWith('listeners:')) {
    return null;
  }

  return fullTopicName.substring(10);
};

const buildPlayOptions = (radio: Radio|Stream) => {
  const options: PlayOptions = {};

  if (typeUtils.isRadio(radio)) {
    return options;
  }

  if (radio.force_hls) {
    options.force_hls = true;
  } else if (radio.force_mpd) {
    options.force_mpd = true;
  }

  return options;
};

/* ---------- NOTIFICATION ---------- */

const buildNotificationData = (
  radio: Radio|Stream,
  streamCodeName: string,
  show: Program|null = null
) => {
  const data: NotificationData = {
    name: radio.name,
    times: null,
    host: null,
    title: null,
    icon: getPictureUrl(radio, show)
  };

  const stream = ScheduleUtils.getStreamFromCodeName(streamCodeName, radio);

  if (stream !== null) {
    data.name = stream.name;
  }

  if (show !== undefined && show !== null) {
    const start = DateTime.fromISO(show.start_at).setZone(config.TIMEZONE)
      .toLocaleString(DateTime.TIME_SIMPLE);
    const end = DateTime.fromISO(show.end_at).setZone(config.TIMEZONE)
      .toLocaleString(DateTime.TIME_SIMPLE);

    data.times = `${start}-${end}`;
    data.host = show.host == null ? null : show.host;
    data.title = show.title;
  }

  return data;
};

const buildMediaSessionMetadata = (data: NotificationData) => {
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
      album: data.title || undefined,
      artwork: [
        { src: data.icon, type: 'image/jpeg' },
      ]
    });
  }
};

const buildNotification = (data: NotificationData) => {
  const options: NotificationOptions = {
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

const showNotification = (
  radio: Radio|Stream,
  streamCodeName: string,
  show: Program|null = null
) => {
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
      if (permission === 'granted') {
        buildNotification(data);
      } else {
        // TODO save choice ?
      }
    });
  }
};

/* ---------- MISC ---------- */

const calculatedFlux = () => {
  const data = {
    // @ts-ignore
    supported: window.navigator.connection !== undefined,
    selected:
      cookies.get(config.COOKIE_PLAYER_FLUX,
        // @ts-ignore
        window.navigator.connection !== undefined ? 'automatic' : 'disabled'),
    allowTwoFeeds: false,
    delayBeforeStop: cookies.get(config.COOKIE_PLAYER_FLUX_DURATION,
      config.PLAYER_STOP_DELAY_HIGH_BANDWIDTH_MS)
  };

  if (data.selected === 'enabled') {
    data.allowTwoFeeds = true;
  } else if (data.selected !== 'disabled'
    // @ts-ignore
    && window.navigator.connection !== undefined
    // @ts-ignore
    && (window.navigator.connection.effectiveType !== undefined
    // @ts-ignore
    && window.navigator.connection.effectiveType === config.PLAYER_MULTI_ALLOWED_TYPE)
    // @ts-ignore
    && (window.navigator.connection.downlink !== undefined)) {
    // @ts-ignore
    if (window.navigator.connection.downlink
      >= config.PLAYER_STOP_DELAY_LOWER_BANDWIDTH_THRESHOLD_MBPS) {
      data.allowTwoFeeds = true;

      // @ts-ignore
      if (window.navigator.connection.downlink
        >= config.PLAYER_STOP_DELAY_HIGH_BANDWIDTH_THRESHOLD_MBPS
        // for mobile connections we only allow the short delay time to reduce data consumption
        // @ts-ignore
        && window.navigator.connection.type !== config.PLAYER_MULTI_DISABLED_TYPE) {
        data.delayBeforeStop = config.PLAYER_STOP_DELAY_HIGH_BANDWIDTH_MS;
      } else {
        data.delayBeforeStop = config.PLAYER_STOP_DELAY_LOWER_BANDWIDTH_MS;
      }
    }
  }

  return data;
};

const getAmazonSongLink = (song: string): string => {
  const songCleaned = song.replace(' - ', ' ');

  /* eslint-disable max-len */
  /* eslint-disable camelcase */
  /* eslint-disable no-undef */
  // @ts-expect-error amazon_affiliate_id is defined on the global scope
  return encodeURI(`https://www.amazon.com/gp/search?ie=UTF8&tag=${amazon_affiliate_id}&linkCode=ur2&index=digital-music&keywords=${songCleaned}`);
};

/* ---------- API ---------- */

const sendListeningSession = (
  playingStatus: PlayerStatus,
  radio: Radio|Stream,
  radioStreamCodeName: string|null,
  session: ListeningSession,
  ending?: boolean
) => {
  if (playingStatus === PlayerStatus.Playing && session.start !== null) {
    const dateTimeEnd = DateTime.local().setZone(config.TIMEZONE);

    if (dateTimeEnd.diff(session.start).as('seconds') < config.LISTENING_SESSION_MIN_SECONDS) {
      return;
    }

    setTimeout(() => {
      ScheduleApi.sendListeningSession(
        radio.code_name,
        radioStreamCodeName,
        session.start!,
        dateTimeEnd,
        session.id!,
        session.ctrl!,
        ending
      );
    },
    1000
    );
  }
};

export default {
  getPictureUrl,
  getNextRadio,
  getNextStream,
  getChannelName,
  formatSong,
  showNotification,
  sendListeningSession,
  calculatedFlux,
  getAmazonSongLink,
  extractTopicName,
  buildPlayOptions
};
