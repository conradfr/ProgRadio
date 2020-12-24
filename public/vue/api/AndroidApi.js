/* eslint-disable no-undef */

import {
  PLAYER_TYPE_RADIO,
  THUMBNAIL_NOTIFICATION_PROGRAM_PATH,
  THUMBNAIL_STREAM_PATH
} from '../config/config';

const hasAndroid = typeof Android !== 'undefined';
// const hasAndroid = false;

const getPictureUrl = (radio, show) => {
  if (show !== undefined && show !== null && show.picture_url !== null) {
    return `${THUMBNAIL_NOTIFICATION_PROGRAM_PATH}${show.picture_url}`;
  }

  if (radio.type === PLAYER_TYPE_RADIO) {
    return `/img/radio/page/${radio.code_name}.png`;
  }

  if (radio.img !== null && radio.img !== '') {
    return `${THUMBNAIL_STREAM_PATH}${radio.img}`;
  }

  return null;
};

export default {
  hasAndroid,
  play(radio, currentShow) {
    if (hasAndroid === false) { return; }
    const showTitle = (typeof currentShow === 'undefined' || currentShow === null) ? null : currentShow.title;
    Android.play(radio.code_name, radio.name, radio.stream_url, showTitle,
      getPictureUrl(radio, currentShow));
  },
  pause() {
    if (hasAndroid === false) { return; }
    Android.pause();
  },
  getState() {
    if (hasAndroid === false) { return; }
    Android.getstate();
  }
};
