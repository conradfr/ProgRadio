import forEach from 'lodash/forEach';

import {
  ANDROID_SONG_MIN_VERSION,
  ANDROID_CHANNEL_IN_LIST_MIN_VERSION,
  THUMBNAIL_NOTIFICATION_PROGRAM_PATH
} from '@/config/config';

import type { Radio } from '@/types/radio';
import type { Stream } from '@/types/stream';
import type { Program } from '@/types/program';

import PlayerUtils from '@/utils/PlayerUtils';
import StreamsUtils from '@/utils/StreamsUtils';

/* eslint-disable no-undef */

// @ts-expect-error Android is defined by the device
const hasAndroid = typeof Android !== 'undefined';
// const hasAndroid = false;

const getVersion = () => {
  if (!hasAndroid) { return 0; }
  // @ts-expect-error Android is defined by the device
  return Android.getVersion !== undefined ? Android.getVersion() : 15; // temp
};

const getPictureUrl = (stream: Stream, radio: Radio|null = null, show: Program|null = null): string|null => {
  if (show !== null && show.picture_url !== null) {
    // @ts-expect-error defined on global scope
    return `${cdnBaseUrl}${THUMBNAIL_NOTIFICATION_PROGRAM_PATH}${show.picture_url}`;
  }

  return StreamsUtils.getPictureUrl(stream, radio);
};

const formatRadios = (streams: Record<string, Stream>): Array<object> => {
  const streamsExport: Array<object> = [];

  forEach(streams, (stream) => {
    if (stream.stream_url) {
      const radioToExport: Record<string, any> = {
        codeName: stream.code_name,
        name: stream.name,
        streamUrl: stream.stream_url,
        pictureUrl: getPictureUrl(stream)
      };

      if (getVersion() >= ANDROID_CHANNEL_IN_LIST_MIN_VERSION) {
        radioToExport.channelName = PlayerUtils.getChannelName(stream);
      }

      streamsExport.push(radioToExport);
    }
  });

  return streamsExport;
};

export default {
  hasAndroid,
  getVersion,
  play(stream: Stream, radio: Radio|null = null, currentShow: Program|null = null) {
    if (!stream || !stream.stream_url) {
      return;
    }

    if (!hasAndroid) { return; }
    const showTitle = currentShow === null ? null : currentShow.title;
    const radioCodeName = radio ? radio.code_name : stream.code_name;

    if (this.getVersion() < ANDROID_SONG_MIN_VERSION) {
      // @ts-expect-error Android is defined by the device
      Android.play(
        stream.code_name,
        stream.name,
        stream.stream_url,
        showTitle,
        getPictureUrl(stream, radio, currentShow)
      );
    } else {
      // @ts-expect-error Android is defined by the device
      Android.play(
        stream.code_name,
        stream.name,
        stream.stream_url,
        showTitle,
        getPictureUrl(stream, radio, currentShow),
        PlayerUtils.getChannelName(stream, radio)
      );
    }
  },
  pause() {
    if (!hasAndroid) { return; }
    // @ts-expect-error Android is defined by the device
    Android.pause();
  },
  list(streams: Stream[]) {
    if (!hasAndroid) { return; }
    // @ts-expect-error Android is defined by the device
    Android.list(JSON.stringify(formatRadios(streams)));
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
