/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
// import { createApp } from 'https://unpkg.com/petite-vue@0.4.1/dist/petite-vue.es.js';
import { createApp } from '../../public/vue/utils/petite-vue.es';
import { Socket } from '../js/phoenix';

// from config
import {
  LISTENING_SESSION_MIN_SECONDS,
  LISTENING_SESSION_SOURCE_SSR,
  WEBSOCKET_DISCONNECT_AFTER,
  WEBSOCKET_MAX_RETRIES
} from './config/config';

const LISTENING_INTERVAL = LISTENING_SESSION_MIN_SECONDS * 1000;

const createVideoElem = () => {
  let videoElem = document.getElementById('videoplayer');
  if (!videoElem) {
    videoElem = document.createElement('audio');
    videoElem.id = 'videoplayer';
    videoElem.style = 'display:none';
    document.body.appendChild(videoElem);
  }
}

/* we load the hls script dynamically once, reducing initial app load */
/* eslint-disable arrow-body-style */
const loadHls = () => {
  return new Promise((resolve, reject) => {
    const hlsElem = document.getElementById('hls-script');
    if (hlsElem !== null) {
      resolve();
      return;
    }

    createVideoElem();

    const hlsScript = document.createElement('script');
    hlsScript.type = 'text/javascript';
    hlsScript.id = 'hls-script';
    hlsScript.src = '/js/hls.min.js';
    hlsScript.onload = resolve;
    hlsScript.onerror = reject;
    document.body.appendChild(hlsScript);
  });
};

/* we load the dash script dynamically once, reducing initial app load */
/* eslint-disable arrow-body-style */
const loadDash = () => {
  return new Promise((resolve, reject) => {
    const dashElem = document.getElementById('dash-script');
    if (dashElem !== null) {
      resolve(true);
      return;
    }

    createVideoElem();

    const dashScript = document.createElement('script');
    dashScript.type = 'text/javascript';
    dashScript.id = 'dash-script';
    dashScript.src = '/js/dash.all.min.js';
    dashScript.onload = resolve;
    dashScript.onerror = reject;
    document.body.appendChild(dashScript);
  });
};

const updateListeningSession = (radioId, dateTimeStart, sessionId, ending) => {

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

  if (ending === true) {
    data.ending = true;
  }

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

const sendPlayingError = (radioId) => {
  if (!this.options.sendStatistics) {
    return;
  }

  // only streams
  if (!radioId.includes('-')) {
    return;
  }

  /* eslint-disable no-undef */
  let url = `https://${apiUrl}/stream_error/${radioId}`;

  /* eslint-disable consistent-return */
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  })
  .then(response => response.json());
}

const setPlayingAlertVisible = (visible) => {
  const elem = document.getElementById('playing-alert');

  if (!elem) {
    return;
  }

  if (visible === true) {
    elem.classList.remove('d-none');
  } else {
    elem.classList.add('d-none');
  }
};

const setAudioVolume = (volume) => {
  if (volume) {
    window.audio.volume = volume;
    return;
  }

  if (typeof appVolume !== 'undefined') {
    window.audio.volume = appVolume;
  }
}

createApp({
  hls: null,
  dash: null,
  socket: null,
  socketTimer: null,
  channels: {},
  playing: false,
  song: null,
  listeners: null,
  lastUpdated: null,
  radioId: null,
  playingStart: null,
  sessionId: null,
  listeningInterval: null,
  options: {
    /* eslint-disable no-undef */
    webSocket: typeof appWebSocket !== 'undefined' ? appWebSocket : true,
    /* eslint-disable no-undef */
    sendStatistics: typeof appSendStatistics !== 'undefined' ? appSendStatistics : true,
  },
  play(streamingUrl, codeName, topic, streamCodeName) {
    setPlayingAlertVisible(false);

    if (this.playing === true) {
      this.stop();
    }

    // to be sure
    if (this.listeningInterval !== null) {
      clearInterval(this.listeningInterval);
      this.listeningInterval = null;
    }

    if (this.options.sendStatistics) {
      /* eslint-disable no-undef */
      sendGaEvent('play', 'SSR', codeName, 3);
    }

    this.playing = true;
    this.radioId = codeName;
    this.sessionId = null;
    this.playerStart = new Date();

    if (streamingUrl.indexOf('.m3u8') !== -1) {
      loadHls().then(() => {
        if (Hls.isSupported()) {
          window.audio = document.getElementById('videoplayer');
          this.hls = new Hls();
          // bind them together
          this.hls.attachMedia(window.audio);

          this.hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              this.playingError();
            }
          });

          this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
            this.hls.loadSource(streamingUrl);
            this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
              setAudioVolume();

              window.audio.play().then(() => {
                this.playingStarted(topic, streamCodeName);
              });
            });
          });
        }
      });
    } else if (streamingUrl.indexOf('.mpd') !== -1) {
      loadDash().then(() => {
        window.audio = document.getElementById('videoplayer');

        this.dash = dashjs.MediaPlayer().create();
        this.dash.initialize(window.audio, streamingUrl, false);

        this.dash.on('error', () => {
          this.playingError();
        });

        this.dash.on('canPlay', () => {
          setAudioVolume();

          window.audio.play().then(() => {
            this.playingStarted(topic, streamCodeName);
          });
        });
      });
    } else {
      const streamUrl = (streamingUrl.substring(0, 5) !== 'https')
        ? `${streamsProxy}?stream=${streamingUrl}` : streamingUrl;

      window.audio = new Audio(`${streamUrl}`);
      setAudioVolume();

      window.audio.onerror = () => {
        this.playingError();
      };

      window.audio.play().then(() => {
        this.playingStarted(topic, streamCodeName);
      });
    }
  },
  stop() {
    // cleaning audio objects (and potentially recreating them afterward) is not really necessary
    // as we should have only one player and only one streaming source but let's do it anyway ...
    if (window.audio !== undefined && window.audio !== null) {
      window.audio.pause();
    }

    if (this.listeningInterval !== null) {
      clearInterval(this.listeningInterval);
      this.listeningInterval = null;
    }

    if (this.hls !== null) {
      this.hls.destroy();
      this.hls = null;
    }

    if (this.dash !== null) {
      this.dash.destroy();
      this.dash = null;
    }

    window.audio = null;
    delete window.audio;

    if (this.playing !== false &&  this.options.sendStatistics) {
      updateListeningSession(this.radioId, this.playingStart, this.sessionId, true);

      /* eslint-disable no-undef */
      sendGaEvent('stop', 'SSR', this.radioId, 1);
    }

    this.playing = false;
    this.radioId = null;
    this.listeningInterval = null;
    this.sessionId = null;
    this.playingStart = null;
  },
  playingStarted(topic, streamCodeName) {
    this.lastUpdated = new Date();
    this.playingStart = new Date();

    // For some reason the interval was not set when the code was at the end of this function
    if (this.options.sendStatistics) {
      this.listeningInterval = setInterval(() => {
        updateListeningSession(this.radioId, this.playingStart, this.sessionId).then((data) => {
          if (data.id !== null) {
            this.sessionId = data.id;
            this.playingStart = new Date(data.date_time_start);
          }
        });
      }, LISTENING_INTERVAL);
    }

    window.audio.addEventListener('timeupdate', () => {
      this.lastUpdated = new Date();
    });

    if (topic !== undefined && topic !== null && topic !== '') {
      this.joinChannel(topic);
    }

    if (streamCodeName !== undefined && streamCodeName !== null && streamCodeName !== '') {
      this.joinChannel(`listeners:${streamCodeName}`);
    }

  },
  playingError() {
    // the delay prevents sending an error when the user just click a link and goes to another page...
    setTimeout(
      () => {
        this.playing = false;

        setPlayingAlertVisible(true);

        if (this.options.sendStatistics) {
          sendPlayingError(codeName);
        }
      },
      2500
    );
  },
  connectSocket() {
    if (!this.options.webSocket) {
      return;
    }

    if (!this.socket) {
      const opts = {
        reconnectAfterMs: (tries) => {
          if (tries >= WEBSOCKET_MAX_RETRIES) {
            return null;
          }

          return [10, 50, 100, 150, 200, 250, 500, 1000, 2000, 5000, 10000, 20000][tries - 1] || 30000;
        }
      };

      this.socket = new Socket(`wss://${apiUrl}/socket`, opts);

      this.socket.onOpen(() => {
        this.setSocketTimer();
      });

      this.socket.onClose(() => {
        this.song = null;
        this.listeners = null;
        this.clearSocketTimer();
      });
    }

    if (this.socket && !this.socket.isConnected()) {
      this.socket.connect();
    }
  },
  setSocketTimer() {
    // reset if currently one
    this.clearSocketTimer();

    this.socketTimer = setTimeout(() => {
      if (this.socket) {
        this.socket.disconnect();
        this.socketTimer = null;
      }
    }, WEBSOCKET_DISCONNECT_AFTER);
  },
  clearSocketTimer() {
    if (this.socketTimer) {
      clearTimeout(this.socketTimer);
      this.socketTimer = null;
    }
  },
  joinChannel(topic) {
    if (!this.options.webSocket) {
      return;
    }

    this.connectSocket();

    // Channel already exists?
    if (!Object.prototype.hasOwnProperty.call(this.channels, topic)) {
      this.channels[topic] = this.socket.channel(topic, {});
    }

    this.channels[topic].join()
      .receive('error', resp => {
        if (topic.startsWith('listeners:')) {
          this.listeners = null;
        } else {
          this.song = null;
        }

        // this.channels[topic] = null;
      })
      .receive('timeout', () => {
        if (topic.startsWith('listeners:')) {
          this.listeners = null;
        } else {
          this.song = null;
        }

        // this.channels[topic] = null;
      });

    this.channels[topic].on('playing', (songData) => {
      this.formatSong(songData);
    });

    this.channels[topic].on('counter_update', (counterData) => {
      this.formatListeners(counterData);
    });

    this.channels[topic].on('quit', () => {
      this.song = null;
      this.listeners = null;
      this.channels[topic] = null;
    });
  },
  formatSong(songData) {
    if (!songData === null || !songData.song) {
      this.song = null;
      return;
    }

    let song = '';
    let hasArtist = false;
    if (songData.song.artist !== undefined && songData.song.artist !== null
      && songData.song.artist !== '') {
      song += songData.song.artist;
      hasArtist = true;
    }

    if (songData.song.title !== undefined && songData.song.title !== null
      && songData.song.title !== '') {
      if (hasArtist === true) {
        song += ' - ';
      }

      song += songData.song.title;
    }

    this.song = song === '' ? null : song;
  },
  formatListeners(listenersData) {
    if (!listenersData || !listenersData.listeners || !listenersData.listeners === 0) {
      this.listeners = null;
      return;
    }

    this.listeners = listenersData.listeners;
  }
}).mount();

