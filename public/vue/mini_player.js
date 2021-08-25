/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
// import { createApp } from 'https://unpkg.com/petite-vue@0.2.2/dist/petite-vue.es.js';
import { createApp } from '../../public/vue/utils/petite-vue.es';

// from config
import {
  LISTENING_SESSION_MIN_SECONDS,
  LISTENING_SESSION_SOURCE_SSR
} from './config/config';

const LISTENING_INTERVAL = LISTENING_SESSION_MIN_SECONDS * 1000;

/* we load the hls script dynamically once, reducing initial app load */
/* eslint-disable arrow-body-style */
const loadHls = () => {
  return new Promise((resolve, reject) => {
    const hlsElem = document.getElementById('hls-script');
    if (hlsElem !== null) {
      resolve();
      return;
    }

    const videoElem = document.createElement('video');
    videoElem.id = 'videoplayer';
    videoElem.style = 'display:none';
    document.body.appendChild(videoElem);

    const hlsScript = document.createElement('script');
    hlsScript.type = 'text/javascript';
    hlsScript.id = 'hls-script';
    hlsScript.src = '/js/hls.js';
    hlsScript.onload = resolve;
    hlsScript.onerror = reject;
    document.body.appendChild(hlsScript);
  });
};

const updateListeningSession = (radioId, dateTimeStart, sessionId) => {
  if (dateTimeStart === undefined || dateTimeStart === null) {
    return;
  }

  const dateTimeEnd = new Date();

  if (dateTimeEnd.getTime() - dateTimeStart.getTime() < LISTENING_INTERVAL) {
    return;
  }

  /* eslint-disable no-undef */
  let url = `https://${apiUrl}/listening_session/`;
  if (sessionId !== null) {
    url += sessionId;
  }

  const data = {
    date_time_start: dateTimeStart.toISOString(),
    date_time_end: dateTimeEnd.toISOString(),
    source: LISTENING_SESSION_SOURCE_SSR,
    ctrl: Math.random()
  };

  if (radioId.includes('-')) {
    data.stream_id = radioId;
  } else {
    data.radio_stream_code_name = `${radioId}_main`;
  }

  /* eslint-disable consistent-return */
  return fetch(url, {
    method: sessionId !== null ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then(response => response.json())
    .then((json) => {
      if (typeof json.id !== 'undefined') {
        return json;
      }
      return null;
    });
};

createApp({
  hls: null,
  playing: false,
  lastUpdated: null,
  radioId: null,
  playingStart: null,
  sessionId: null,
  listeningInterval: null,
  play(streamingUrl, codeName) {
    /* eslint-disable no-undef */
    sendGaEvent('play', 'SSR', codeName, 3);

    this.playing = true;
    this.radioId = codeName;
    this.sessionId = null;
    this.playerStart = new Date();
    let startPlayPromise;

    if (streamingUrl.indexOf('.m3u8') !== -1) {
      loadHls().then(() => {
        if (Hls.isSupported()) {
          window.audio = document.getElementById('videoplayer');
          this.hls = new Hls();
          // bind them together
          this.hls.attachMedia(window.audio);
          this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
            this.hls.loadSource(streamingUrl);
            this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
              startPlayPromise = window.audio.play();
            });
          });
        }
      });
    } else {
      const streamUrl = (streamingUrl.substring(0, 5) !== 'https')
        ? `${streamsProxy}?stream=${streamingUrl}` : streamingUrl;

      window.audio = new Audio(`${streamUrl}`);
      startPlayPromise = window.audio.play();
    }

    if (startPlayPromise !== undefined) {
      startPlayPromise.then(() => {
        window.audio.addEventListener('timeupdate', () => {
          this.lastUpdated = new Date();
        });

        this.lastUpdated = new Date();
        this.playingStart = new Date();

        this.listeningInterval = setInterval(() => {
          updateListeningSession(this.radioId, this.playingStart, this.sessionId).then((data) => {
            if (data.id !== null) {
              this.sessionId = data.id;
              this.playingStart = new Date(data.date_time_start);
            }
          });
        }, LISTENING_INTERVAL);
      }).catch(() => this.stop());
    }
  },
  stop() {
    // cleaning audio objects (and potentially recreating them afterward) is not really necessary
    // as we should have only one player and only one streaming source but let's do it anyway ...
    if (window.audio !== undefined && window.audio !== null) {
      window.audio.pause();
    }

    if (this.hls !== null) {
      this.hls.destroy();
      this.hls = null;
    }

    window.audio = null;
    delete window.audio;

    if (this.playing !== false) {
      updateListeningSession(this.radioId, this.playingStart, this.sessionId);
      /* eslint-disable no-undef */
      sendGaEvent('stop', 'SSR', this.radioId, 1);
    }

    if (this.listeningInterval !== null) {
      clearInterval(this.listeningInterval);
    }

    this.playing = false;
    this.radioId = null;
    this.listeningInterval = null;
    this.sessionId = null;
    this.playingStart = null;
  }
}).mount();
