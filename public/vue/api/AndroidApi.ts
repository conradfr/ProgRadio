/* eslint-disable no-undef */

import forEach from 'lodash/forEach';

import {
  ANDROID_SONG_MIN_VERSION,
  ANDROID_CHANNEL_IN_LIST_MIN_VERSION,
  THUMBNAIL_NOTIFICATION_PROGRAM_PATH,
  THUMBNAIL_STREAM_PATH,
  THUMBNAIL_PAGE_PATH
} from '@/config/config';

import type { Radio } from '@/types/radio';
import type { Stream } from '@/types/stream';
import type { RadioStream } from '@/types/radio_stream';
import type { Program } from '@/types/program';

import typeUtils from '../utils/typeUtils';
import PlayerUtils from '../utils/PlayerUtils';
import ScheduleUtils from '../utils/ScheduleUtils';

// @ts-expect-error Android is defined by the device
const hasAndroid = typeof Android !== 'undefined';
// const hasAndroid = false;

const getVersion = () => {
  if (!hasAndroid) { return 0; }
  // @ts-expect-error Android is defined by the device
  return Android.getVersion !== undefined ? Android.getVersion() : 15; // temp
};

const getPictureUrl = (radio: Radio|Stream, show: Program|null = null): string|null => {
  if (show !== null && show.picture_url !== null) {
    return `${THUMBNAIL_NOTIFICATION_PROGRAM_PATH}${show.picture_url}`;
  }

  if (typeUtils.isRadio(radio)) {
    return `/img/radio/page/${radio.code_name}.png`;
  }

  if (radio.img_alt !== null && radio.img_alt !== '') {
    return `${THUMBNAIL_PAGE_PATH}${radio.img_alt}.png`;
  }

  if (radio.img !== null && radio.img !== '') {
    return `${THUMBNAIL_STREAM_PATH}${radio.img}`;
  }

  return null;
};

const formatRadios = (radios: Record<string, Radio>): Array<object> => {
  const radiosExport: Array<object> = [];

  forEach(radios, (radio) => {
    if (typeUtils.isStream(radio) || radio.streaming_enabled) {
      let codeName = radio.code_name;
      let streamUrl = null;

      if (typeUtils.isRadio(radio)) {
        codeName = `${radio.code_name}_main`;
        const stream = ScheduleUtils.getStreamFromCodeName(`${radio.code_name}_main`, radio);
        if (stream !== null) {
          streamUrl = stream.url;
        }
      } else {
        // @ts-ignore
        streamUrl = radio.stream_url;
      }

      if (streamUrl !== undefined && streamUrl !== null) {
        const radioToExport: Record<string, any> = {
          codeName,
          name: radio.name,
          streamUrl,
          pictureUrl: getPictureUrl(radio)
        };

        if (getVersion() >= ANDROID_CHANNEL_IN_LIST_MIN_VERSION) {
          radioToExport.channelName = PlayerUtils.getChannelName(radio, codeName);
        }

        radiosExport.push(radioToExport);
      }
    }
  });

  return radiosExport;
};

export default {
  hasAndroid,
  getVersion,
  play(radio: Radio|Stream, stream: RadioStream|null = null, currentShow: Program|null = null) {
    if (!hasAndroid) { return; }
    const showTitle = currentShow === null ? null : currentShow.title;
    const radioCodeName = stream === null ? radio.code_name : stream.code_name;
    const radioName = stream === null ? radio.name : stream.name;
    const streamUrl = stream === null ? radio.stream_url : stream.url;

    if (streamUrl === null || streamUrl === undefined) {
      return;
    }

    if (this.getVersion() < ANDROID_SONG_MIN_VERSION) {
      // @ts-expect-error Android is defined by the device
      Android.play(
        radioCodeName,
        radioName,
        streamUrl,
        showTitle,
        getPictureUrl(radio, currentShow)
      );
    } else {
      // @ts-expect-error Android is defined by the device
      Android.play(
        radioCodeName,
        radioName,
        streamUrl,
        showTitle,
        getPictureUrl(radio, currentShow),
        PlayerUtils.getChannelName(radio, radioCodeName)
      );
    }
  },
  pause() {
    if (!hasAndroid) { return; }
    // @ts-expect-error Android is defined by the device
    Android.pause();
  },
  list(radios: Radio[]|Stream[]) {
    if (!hasAndroid) { return; }
    // @ts-expect-error Android is defined by the device
    Android.list(JSON.stringify(formatRadios(radios)));
  },
  getState() {
    if (!hasAndroid) { return; }
    // @ts-expect-error Android is defined by the device
    Android.getstate();
  },
  timer(minutes: number|null) {
    // @ts-expect-error Android is defined by the device
    Android.timer(minutes);
  }
};
