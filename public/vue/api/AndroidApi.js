/* eslint-disable no-undef */

const hasAndroid = typeof Android !== 'undefined';

const PLAYBACK_PLAYING = 0;
const PLAYBACK_PAUSED = 1;

export default {
  update(name, show) {
    if (hasAndroid === false) { return; }
    Android.updateRadioShow(name, show);
  },
  playing() {
    if (hasAndroid === false) { return; }
    Android.updatePlaybackStatus(PLAYBACK_PLAYING);
  },
  pause() {
    if (hasAndroid === false) { return; }
    Android.updatePlaybackStatus(PLAYBACK_PAUSED);
  }
};
