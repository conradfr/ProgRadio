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
  play(radio, stream, currentShow) {
    if (hasAndroid === false) { return; }
    const showTitle = currentShow === undefined || currentShow === null ? null : currentShow.title;
    const radioCodeName = stream === undefined || stream === null
      ? radio.code_name : stream.code_name;
    const radioName = stream === undefined || stream === null ? radio.name : stream.name;
    const streamUrl = stream === undefined || stream === null ? radio.stream_url : stream.url;

    Android.play(radioCodeName, radioName, streamUrl, showTitle,
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
