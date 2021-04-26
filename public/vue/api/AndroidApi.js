/* eslint-disable no-undef */

import forEach from 'lodash/forEach';

import {
  PLAYER_TYPE_RADIO,
  PLAYER_TYPE_STREAM,
  THUMBNAIL_NOTIFICATION_PROGRAM_PATH,
  THUMBNAIL_STREAM_PATH,
  ANDROID_TIMER_MIN_VERSION
} from '../config/config';

import ScheduleUtils from '../utils/ScheduleUtils';

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

const formatRadios = (radios) => {
  const radiosExport = [];
  forEach(radios, (radio) => {
    if (radio.type === PLAYER_TYPE_STREAM || radio.streaming_enabled === true) {
      let codeName = radio.code_name;
      let streamUrl = null;
      if (radio.type === PLAYER_TYPE_RADIO) {
        codeName = `${radio.code_name}_main`;
        const stream = ScheduleUtils.getStreamFromCodeName(`${radio.code_name}_main`, radio);
        if (stream !== null) {
          streamUrl = stream.url;
        }
      } else {
        streamUrl = radio.stream_url;
      }

      if (streamUrl !== undefined && streamUrl !== null) {
        radiosExport.push(
          {
            codeName,
            name: radio.name,
            streamUrl,
            pictureUrl: getPictureUrl(radio)
          }
        );
      }
    }
  });

  return radiosExport;
};

export default {
  hasAndroid,
  getVersion() {
    if (hasAndroid === false) { return 0; }
    return Android.getVersion !== undefined ? Android.getVersion() : 15; // temp
  },
  play(radio, stream, currentShow) {
    if (hasAndroid === false) { return; }
    const showTitle = currentShow === undefined || currentShow === null ? null : currentShow.title;
    const radioCodeName = stream === undefined || stream === null
      ? radio.code_name : stream.code_name;
    const radioName = stream === undefined || stream === null ? radio.name : stream.name;
    const streamUrl = stream === undefined || stream === null ? radio.stream_url : stream.url;

    if (streamUrl === null || streamUrl === undefined) {
      return;
    }

    Android.play(radioCodeName, radioName, streamUrl, showTitle,
      getPictureUrl(radio, currentShow));
  },
  pause() {
    if (hasAndroid === false) { return; }
    Android.pause();
  },
  list(radios) {
    if (hasAndroid === false) { return; }
    Android.list(JSON.stringify(formatRadios(radios)));
  },
  getState() {
    if (hasAndroid === false) { return; }
    Android.getstate();
  },
  timer(minutes) {
    if (hasAndroid === false || this.getVersion() < ANDROID_TIMER_MIN_VERSION) { return; }
    Android.timer(minutes);
  }
};
