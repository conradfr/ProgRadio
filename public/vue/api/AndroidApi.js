/* eslint-disable no-undef */

// const hasAndroid = typeof Android !== 'undefined';
const hasAndroid = false;

// const PLAYBACK_PLAYING = 0;
// const PLAYBACK_PAUSED = 1;

export default {
  hasAndroid,
  update(radio, currentShow) {
    if (hasAndroid === false) { return; }
    const showTitle = (typeof currentShow === 'undefined' || currentShow === null) ? null : currentShow.title;
    Android.update(radio.name, showTitle);
  },
  play(radio, currentShow) {
    if (hasAndroid === false) { return; }
    const showTitle = (typeof currentShow === 'undefined' || currentShow === null) ? null : currentShow.title;
    Android.play(radio.name, showTitle, radio.streamingUrl);
  },
  pause() {
    if (hasAndroid === false) { return; }
    Android.pause();
  },
  toggle(radio) {
    Android.toggle(radio.name, radio.streamingUrl);
  }
};
