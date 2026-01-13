import { createApp } from './utils/petite-vue.es.js';
import cookies from './utils/cookies';
import { Socket } from '../js/phoenix';
import noUiSlider from 'nouislider';

// from config
import {
  LISTENING_SESSION_MIN_SECONDS,
  LISTENING_SESSION_SOURCE_SSR,
  WEBSOCKET_DISCONNECT_AFTER,
  WEBSOCKET_MAX_RETRIES,
  WEBSOCKET_HEARTBEAT,
  PLAYER_STATE_LOADING,
  PLAYER_STATE_PLAYING,
  PLAYER_STATE_STOPPED,
  POPUP_SETTINGS,
  POPUP_URL_WILDCARD,
  PROGRADIO_AGENT,
  RADIOADDICT_AGENT,
  COOKIE_VOLUME
} from './config/config.js';

/* eslint-disable no-undef */

const LISTENING_INTERVAL = LISTENING_SESSION_MIN_SECONDS * 1000;

// todo now that we removed the dynamic video tag, refactor the window.audio = elem.

/* we load the hls script dynamically once, reducing initial app load */
const loadHls = () => {
  return new Promise((resolve, reject) => {
    const hlsElem = document.getElementById('hls-script');
    if (hlsElem !== null) {
      resolve();
      return;
    }

    const hlsScript = document.createElement('script');
    hlsScript.type = 'text/javascript';
    hlsScript.id = 'hls-script';
    hlsScript.src = '/js/hls.light.min.js';
    hlsScript.onload = resolve;
    hlsScript.onerror = reject;
    document.body.appendChild(hlsScript);
  });
};

/* we load the dash script dynamically once, reducing initial app load */
const loadDash = () => {
  return new Promise((resolve, reject) => {
    const dashElem = document.getElementById('dash-script');
    if (dashElem !== null) {
      resolve(true);
      return;
    }

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

const sendPlayingError = (radioId, errorText) => {
  // only streams
  if (!radioId || !radioId.includes('-')) {
    return;
  }

  const url = `https://${apiUrl}/stream_error/${radioId}`;

  const params = {};

  if (errorText) {
    params.error = errorText;
  }

  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  }).then(response => response.json());
};

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
    if (window.audio) {
      window.audio.volume = volume / 10;
    }
    return;
  }

  if (typeof appVolume !== 'undefined' && window.audio) {
    window.audio.volume = appVolume;
  }

  // default
  if (window.audio) {
    window.audio.volume = cookies.get(COOKIE_VOLUME, 10) / 10
  }
};

const setTitle = (song) => {
  const elems = document.getElementsByClassName('stream-title');
  if (!elems || !elems[0] || !elems[0].dataset.title) {
    return;
  }

  let title = '';

  if (song) {
    title += `♫ ${song} - `;
  }

  document.title = `${title}${elems[0].dataset.title}`;
};

const incrementPlayCount = (stationUuid) => {
  if (appEnv !== 'dev') {
    return;
  }

  // not a stream
  if (!stationUuid.includes('-')) {
    return;
  }

  fetch(`https://${apiUrl}/config`, {
    headers: { 'Content-Type': 'application/json' }
  })
    .then((response) => {
      return response.json();
    })
    .then((config) => {
      if (config && config.radio_browser_url) {
        fetch(`${config.radio_browser_url}/json/url/${stationUuid}`, {
          headers: { 'User-Agent': isProgRadio ? PROGRADIO_AGENT : RADIOADDICT_AGENT }
        });
      }
    })
    .catch ((_e) => {
      // nothing
    });
};

createApp({
  hls: null,
  dash: null,
  socket: null,
  socketTimer: null,
  channels: {},
  playing: PLAYER_STATE_STOPPED,
  song: null,
  cover: null,
  listeners: null,
  visibilityListeners: {},
  lastUpdated: null,
  radioId: null,
  playingStart: null,
  sessionId: null,
  listeningInterval: null,
  options: {
    webSocket: typeof appWebSocket !== 'undefined' ? appWebSocket : true,
    sendStatistics: typeof appSendStatistics !== 'undefined' ? appSendStatistics : true,
  },
  init() {
    const slider = document.getElementById('volume-slider');
    if (slider) {
      const volume = cookies.get(COOKIE_VOLUME, 10)
      setAudioVolume(volume);
      noUiSlider.create(slider, {
        start: volume,
        connect: 'lower',
        range: {
          'min': 0,
          'max': 10
        }
      });

      slider.noUiSlider.on('update.one', (e) => {
        const newVolume = parseFloat(e[0]).toFixed(2);
        cookies.set(COOKIE_VOLUME, newVolume);
        setAudioVolume(newVolume);
      });
    }
  },
  play(streamingUrl, codeName, options) {
    if (!options) {
      // eslint-disable-next-line no-param-reassign
      options = {};
    }

    setPlayingAlertVisible(false);

    if (this.playing !== PLAYER_STATE_STOPPED) {
      this.stop();
    }

    // to be sure
    if (this.listeningInterval !== null) {
      clearInterval(this.listeningInterval);
      this.listeningInterval = null;
    }

    if (this.options.sendStatistics) {
      sendGaEvent('play', 'SSR', codeName, 3);
    }

    if (options.popup && options.popup === true) {
      window.open(popupUrl.replace(POPUP_URL_WILDCARD, codeName), '', POPUP_SETTINGS);
      return;
    }

    this.playing = PLAYER_STATE_LOADING;
    this.radioId = codeName;
    this.sessionId = null;
    this.playerStart = new Date();

    if (streamingUrl.indexOf('.m3u8') !== -1 || (options.force_hls && options.force_hls === true)) {
      loadHls().then(() => {
        if (Hls.isSupported()) {
          window.audio = document.getElementById('videoplayer');
          this.hls = new Hls();
          // bind them together
          this.hls.attachMedia(window.audio);

          this.hls.on(Hls.Events.ERROR, (_event, data) => {
            if (data.fatal) {
              this.playingError(codeName, data.details);
            }
          });

          this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
            this.hls.loadSource(streamingUrl);
            this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
              setAudioVolume();

              window.audio.play().then(() => {
                this.playingStarted(
                  options.topic ? options.topic.trim() : null,
                  options.streamCodeName ? options.streamCodeName.trim() : null
                );
              });
            });
          });
        }
      });
    } else if (streamingUrl.indexOf('.mpd') !== -1 || (options.force_mpd && options.force_mpd === true)) {
      loadDash().then(() => {
        window.audio = document.getElementById('videoplayer');

        this.dash = dashjs.MediaPlayer().create();
        this.dash.initialize(window.audio, streamingUrl, false);

        this.dash.on('error', () => {
          this.playingError(codeName);
        });

        this.dash.on('canPlay', () => {
          setAudioVolume();

          window.audio.play().then(() => {
            this.playingStarted(
              options.topic ? options.topic.trim() : null,
              options.streamCodeName ? options.streamCodeName.trim() : null
            );
          });
        });
      });
    } else if (options && options.force_proxy && options.force_proxy === true) {
      this.play(
        `${streamsProxy}?k=${streamsProxyKey}&stream=${streamingUrl}`,
        codeName,
        { ...options, force_proxy: false }
      );
    } else {
      /*
      const streamUrl = (streamingUrl.trim().substring(0, 5) !== 'https')
        ? `${streamsProxy}?k=${streamsProxyKey}&stream=${streamingUrl}` : streamingUrl; */

      // window.audio = new Audio(`${streamUrl}`);
      window.audio = document.getElementById('videoplayer');
      window.audio.src = streamingUrl.trim();
      setAudioVolume();

      window.audio.onerror = (error) => {
        // if stream failed and is http we try to switch to our https proxy
        if (streamingUrl.trim().substring(0, 5) !== 'https') {
          this.stop();
          this.play(
            streamingUrl,
            codeName,
            { ...options, force_proxy: true }
          );
          return;
        }

        this.playingError(codeName, error.target.error.message || null);
      };

      window.audio.play().then(() => {
        this.playingStarted(
          options.topic ? options.topic.trim() : null,
          options.streamCodeName ? options.streamCodeName.trim() : null
        );
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

    if (this.playing !== false && this.options.sendStatistics) {
      updateListeningSession(this.radioId, this.playingStart, this.sessionId, true);

      sendGaEvent('stop', 'SSR', this.radioId, 1);
    }

    this.playing = PLAYER_STATE_STOPPED;
    this.radioId = null;
    this.listeningInterval = null;
    this.sessionId = null;
    this.playingStart = null;
  },
  playingStarted(topic, streamCodeName) {
    this.playing = PLAYER_STATE_PLAYING;
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

      setTimeout(() => {
        incrementPlayCount(this.radioId);
      }, LISTENING_INTERVAL + 500);
    }

    window.audio.addEventListener('timeupdate', () => {
      this.lastUpdated = new Date();
    });

    if (topic && topic.trim() !== '') {
      this.joinChannel(topic.trim());
    }

    if (streamCodeName && streamCodeName.trim() !== '') {
      this.joinChannel(`listeners:${streamCodeName.trim()}`);
    }
  },
  playingError(codeName, errorText) {
    // the delay prevents sending an error when the user just click a link and goes to another page...
    setTimeout(
      () => {
        this.playing = PLAYER_STATE_STOPPED;

        setPlayingAlertVisible(true);

        if (this.options.sendStatistics) {
          sendPlayingError(codeName, errorText);
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
        heartbeatIntervalMs: WEBSOCKET_HEARTBEAT,
        reconnectAfterMs: (tries) => {
          if (tries >= WEBSOCKET_MAX_RETRIES) {
            return null;
          }

          // eslint-disable-next-line @stylistic/js/max-len
          return [1000, 5000, 10000, 15000, 20000, 25000, 50000, 100000, 200000, 500000, 1000000, 2000000][tries - 1] || 30000;
        }
      };

      this.socket = new Socket(`wss://${apiUrl}/socket`, opts);

      this.socket.onOpen(() => {
        this.setSocketTimer();
      });

      this.socket.onClose(() => {
        this.song = null;
        this.cover = null;
        this.listeners = null;
        this.clearSocketTimer();
        setTitle(null);
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

    // optimize listeners channel sub has many people will not have the tab running in the background
    if (topic.trim().startsWith('listeners:') && !this.visibilityListeners[topic]) {
      this.visibilityListeners[topic] = true;
      document.addEventListener('visibilitychange', () => {
        if (this.channels[topic] && document.hidden) {
          this.channels[topic].leave();
          delete this.channels[topic];
          this.listeners = null;
        } else {
          this.joinChannel(topic);
        }
      });
    }

    this.connectSocket();

    // Channel already exists?
    if (Object.prototype.hasOwnProperty.call(this.channels, topic)) {
      return;
    }

    this.channels[topic] = this.socket.channel(topic, {});

    this.channels[topic].join()
      .receive('error', (_resp) => {
        if (topic.startsWith('listeners:')) {
          this.listeners = null;
        } else {
          this.song = null;
          this.cover = null;
          setTitle(null);
        }

        // this.channels[topic] = null;
      })
      .receive('timeout', () => {
        if (topic.startsWith('listeners:')) {
          this.listeners = null;
        } else {
          this.song = null;
          this.cover = null;
          setTitle(null);
        }

        // this.channels[topic] = null;
      });

    this.channels[topic].on('playing', (songData) => {
      this.formatSong(songData);
      setTitle(this.song);
    });

    this.channels[topic].on('counter_update', (counterData) => {
      this.formatListeners(counterData);
    });

    this.channels[topic].on('quit', () => {
      this.song = null;
      this.cover = null;
      this.listeners = null;
      this.channels[topic] = null;
      delete this.channels[topic];
      setTitle(null);
    });
  },
  formatSong(songData) {
    if (!songData || !songData.song) {
      this.song = null;
      this.cover = null;
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
    this.cover = songData.song.cover_url ? songData.song.cover_url : null;
  },
  formatListeners(listenersData) {
    if (!listenersData || !listenersData.listeners || !listenersData.listeners === 0) {
      this.listeners = null;
      return;
    }

    this.listeners = listenersData.listeners;
  }
}).mount();
