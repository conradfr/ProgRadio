import { createApp, nextTick } from './utils/petite-vue.es.js';
import cookies from './utils/cookies';
import ChatUtils from './utils/chatUtils';
import { Socket, Presence } from '../js/phoenix';

import ITunesApi from './api/ITunesApi';
import streamFavorite from './miniplayer/streamFavorite.js';

import type { PlayOptions as SpaPlayOptions } from './types/play_options';
import type { ChatMessage } from './types/chat_message';
import type { ChatParticipant, ParticipantMeta } from './types/chat_participant';

// from config
import {
  LISTENING_SESSION_MIN_SECONDS,
  LISTENING_SESSION_INTERVAL_SECONDS,
  LISTENING_SESSION_SOURCE_SSR,
  WEBSOCKET_DISCONNECT_AFTER,
  WEBSOCKET_MAX_RETRIES,
  WEBSOCKET_HEARTBEAT,
  PLAYER_STATE_LOADING,
  PLAYER_STATE_PLAYING,
  PLAYER_STATE_STOPPED,
  POPUP_SETTINGS,
  POPUP_URL_WILDCARD,
  COOKIE_VOLUME,
  SOURCE_INCREMENT_COUNT,
  PROGRADIO_AGENT,
  RADIOADDICT_AGENT,
  YOUTUBE_START_TIMEOUT_SECONDS,
  CHAT_NAME_MAX_LENGTH,
  CHAT_MAX_MESSAGES
} from './config/config.js';

// defined on the global scope by the twig layouts (base, _partials/mini_player, admin pages)
declare const apiUrl: string;
declare const isProgRadio: boolean;
declare const popupUrl: string;
declare const streamsProxy: string;
declare const streamsProxyKey: string;
declare const appWebSocket: boolean | undefined;
declare const appSendStatistics: boolean | undefined;
declare const appVolume: number | undefined;
declare const sendGaEvent: (event: string, category: string, label: string | null, value: number) => void;

// loaded dynamically by loadHls, loadDash and loadYoutubeApi, untyped
declare const Hls: any;
declare const dashjs: any;
declare const YT: any;

// bootstrap bundle loaded by base.html.twig
declare const bootstrap: any;

// window properties used by the player, kept local to not leak into the spa types
interface MiniPlayerWindow extends Window {
  audio?: HTMLMediaElement | null
  YT?: any
  onYouTubeIframeAPIReady?: () => void
}

const win = window as MiniPlayerWindow;

// options of the init() call of the twig pages
interface InitOptions {
  song?: SongData['song']
  topic?: string
  radioOrStreamId?: string
  historyUrl?: string
}

// options of the play() calls of the twig pages, the force_* ones are shared with the spa
interface PlayOptions extends SpaPlayOptions {
  popup?: boolean
  is_stream_url_generated?: boolean
  topic?: string
  radioOrStreamId?: string
  source?: string
}

interface FavoriteOptions {
  streamId: string
  radioCodeName: string | null
  logged: boolean
  favorite: boolean
  loginUrl: string
}

// "playing" event of the song channels
interface SongData {
  song?: {
    artist?: string | null
    title?: string | null
    cover_url?: string | null
  } | null
}

// "counter_update" event of the listeners channels
interface ListenersData {
  listeners?: number | null
}

interface ListeningSessionData {
  date_time_start: string
  date_time_end: string
  source: string
  ctrl: number
  ending?: boolean
  stream_id?: string
}

interface ListeningSessionResponse {
  id: string | null
  date_time_start: string
}

type Channel = ReturnType<Socket['channel']>;

const LISTENING_MIN_INTERVAL = LISTENING_SESSION_MIN_SECONDS * 1000;
const LISTENING_INTERVAL = LISTENING_SESSION_INTERVAL_SECONDS * 1000;
const YOUTUBE_START_TIMEOUT = YOUTUBE_START_TIMEOUT_SECONDS * 1000;

// todo now that we removed the dynamic video tag, refactor the win.audio = elem.

/* we load the hls script dynamically once, reducing initial app load */
const loadHls = () => {
  return new Promise<void>((resolve, reject) => {
    const hlsElem = document.getElementById('hls-script');
    if (hlsElem !== null) {
      resolve();
      return;
    }

    const hlsScript = document.createElement('script');
    hlsScript.type = 'text/javascript';
    hlsScript.id = 'hls-script';
    hlsScript.src = '/js/hls.light.min.js';
    hlsScript.onload = () => resolve();
    hlsScript.onerror = reject;
    document.body.appendChild(hlsScript);
  });
};

/* we load the YouTube iframe api script dynamically once */
let youtubeApiPromise: Promise<void> | null = null;
const loadYoutubeApi = () => {
  if (youtubeApiPromise !== null) {
    return youtubeApiPromise;
  }

  youtubeApiPromise = new Promise<void>((resolve, reject) => {
    if (win.YT && win.YT.Player) {
      resolve();
      return;
    }

    // called by the YouTube script once the api is usable
    const previousCallback = win.onYouTubeIframeAPIReady;
    win.onYouTubeIframeAPIReady = () => {
      if (typeof previousCallback === 'function') {
        previousCallback();
      }
      resolve();
    };

    const youtubeScript = document.createElement('script');
    youtubeScript.type = 'text/javascript';
    youtubeScript.id = 'youtube-script';
    youtubeScript.src = 'https://www.youtube.com/iframe_api';
    youtubeScript.onerror = reject;
    document.body.appendChild(youtubeScript);
  });

  return youtubeApiPromise;
};

/* we load the dash script dynamically once, reducing initial app load */
const loadDash = () => {
  return new Promise<boolean>((resolve, reject) => {
    const dashElem = document.getElementById('dash-script');
    if (dashElem !== null) {
      resolve(true);
      return;
    }

    const dashScript = document.createElement('script');
    dashScript.type = 'text/javascript';
    dashScript.id = 'dash-script';
    dashScript.src = '/js/dash.all.min.js';
    dashScript.onload = () => resolve(true);
    dashScript.onerror = reject;
    document.body.appendChild(dashScript);
  });
};

const getStreamUrl = async (id: string): Promise<string | null> => {
  const url = `https://${apiUrl}/stream_url/${id}`;

  return fetch(url)
    .then(response => response.json())
    .then((json) => {
      if (typeof json.stream_url !== 'undefined') {
        return json.stream_url;
      }
      return null;
    });
};

const updateListeningSession = (
  radioId: string,
  dateTimeStart: Date | null,
  sessionId: string | null,
  ending?: boolean
): Promise<ListeningSessionResponse | null> | undefined => {
  if (dateTimeStart === undefined || dateTimeStart === null) {
    return;
  }

  const dateTimeEnd = new Date();

  if (dateTimeEnd.getTime() - dateTimeStart.getTime() < LISTENING_MIN_INTERVAL) {
    return;
  }

  let url = `https://${apiUrl}/listening_session/`;
  if (sessionId !== null) {
    url += sessionId;
  }

  const data: ListeningSessionData = {
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

const sendPlayingError = (radioId: string | null, errorText?: string | null) => {
  // only streams
  if (!radioId || !radioId.includes('-')) {
    return;
  }

  const url = `https://${apiUrl}/stream_error/${radioId}`;

  const params: { error?: string } = {};

  if (errorText) {
    params.error = errorText;
  }

  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  }).then(response => response.json());
};

const setPlayingAlertVisible = (visible: boolean) => {
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

// volume: 0 to 10 (cookie, slider), as a string or a number
const setAudioVolume = (volume?: number | string) => {
  if (volume) {
    if (win.audio) {
      win.audio.volume = Number(volume) / 10;
    }
    return;
  }

  if (typeof appVolume !== 'undefined' && win.audio) {
    win.audio.volume = appVolume;
  }

  // default
  if (win.audio) {
    win.audio.volume = Number(cookies.get(COOKIE_VOLUME, 10)) / 10
  }
};

const setTitle = (song: string | null) => {
  const elems = document.getElementsByClassName('stream-title') as HTMLCollectionOf<HTMLElement>;
  if (!elems || !elems[0] || !elems[0].dataset.title) {
    return;
  }

  let title = '';

  if (song) {
    title += `♫ ${song} - `;
  }

  document.title = `${title}${elems[0].dataset.title}`;
};

const incrementPlayCount = (stationUuid: string | null) => {
  if (!stationUuid) {
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
    .then((config: { radio_browser_url?: string } | null) => {
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

// ---------- CHAT ----------

// helpers shared with the spa chat
const { getSavedName, saveName, keepLast, formatTime } = ChatUtils;

createApp({
  // config
  options: {
    webSocket: typeof appWebSocket !== 'undefined' ? appWebSocket : true,
    sendStatistics: typeof appSendStatistics !== 'undefined' ? appSendStatistics : true,
  },
  // player
  hls: null as any,
  dash: null as any,
  socket: null as Socket | null,
  socketTimer: null as ReturnType<typeof setTimeout> | null,
  channels: {} as Record<string, Channel>,
  playing: PLAYER_STATE_STOPPED as number,
  song: null as string | null,
  cover: null as string | null,
  listeners: null as number | null,
  visibilityListeners: {} as Record<string, boolean>,
  lastUpdated: null as Date | null,
  radioId: null as string | null,
  playingStart: null as Date | null,
  sessionId: null as string | null,
  listeningInterval: null as ReturnType<typeof setInterval> | null,
  initOptions: null as InitOptions | null,
  favorite: false,
  favoriteOptions: null as FavoriteOptions | null,
  // ----- chat -----
  chatChannels: {} as Record<string, Channel>,
  currentChatTopic: null as string | null,
  modalShown: false as boolean,
  hasNewMessages: false as boolean,
  name: getSavedName() ?? `Anonymous${Math.floor(Math.random() * 1000)}`,
  // presence key of the current user, sent by the server on join
  presenceKey: null as string | null,
  participants: [] as ChatParticipant[],
  messages: [] as ChatMessage[],
  // ctrls of the messages sent by this user (also used to know its own messages)
  msgCtrls: [] as number[],
  newMessage: '',
  // actions
  init(options?: InitOptions) {
    this.initOptions = options;

    if (options) {
      setTimeout(() => {
        if (options.song) {
          this.formatSong({ song: options.song });
        }

        if (options.topic && options.topic.trim() !== '') {
          this.joinChannel(options.topic.trim());
        }

        if (options.radioOrStreamId && options.radioOrStreamId.trim() !== '') {
          this.joinChannel(`listeners:${options.radioOrStreamId.trim()}`);
          // temp disable on radios
          if (options.radioOrStreamId.trim().indexOf('-') > -1) {
            this.joinChatChannel(`chat:${options.radioOrStreamId.trim()}`);
          }
        }
      }, 50);
    }

    // native range input (0 to 10) rendered by the twig pages
    const slider = document.getElementById('volume-slider') as HTMLInputElement | null;
    if (slider) {
      // fill of the lower part of the track, see page/stream.scss
      const setSliderFill = () => {
        slider.style.setProperty('--range-value', String(Number(slider.value) / 10));
      };

      const volume = Number(cookies.get(COOKIE_VOLUME, 10));
      setAudioVolume(volume);
      slider.value = String(volume);
      setSliderFill();

      slider.addEventListener('input', () => {
        const newVolume = parseFloat(slider.value).toFixed(2);
        cookies.set(COOKIE_VOLUME, newVolume);
        setAudioVolume(newVolume);
        setSliderFill();
      });
    }
  },
  // options: { streamId, radioCodeName, logged, favorite (logged only, rendered by the server), loginUrl }
  initFavorite(options: FavoriteOptions) {
    this.favoriteOptions = options;
    this.favorite = options.logged ? options.favorite : streamFavorite.isFavorite(options.streamId);
  },
  toggleFavorite() {
    this.favorite = !this.favorite;
    streamFavorite.toggle(this.favoriteOptions, this.favorite);
  },
  async play(streamingUrl: string, codeName: string, options?: PlayOptions) {
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
      window.open(popupUrl.replace(POPUP_URL_WILDCARD, codeName), 'radiopopup', POPUP_SETTINGS);
      return;
    }

    this.playing = PLAYER_STATE_LOADING;
    this.radioId = codeName;
    this.sessionId = null;

    if (options && options.is_stream_url_generated) {
      // eslint-disable-next-line no-param-reassign
      streamingUrl = await getStreamUrl(codeName) || streamingUrl;
    }

    if (streamingUrl.indexOf('.m3u8') !== -1 || (options.force_hls && options.force_hls === true)) {
      loadHls().then(() => {
        if (Hls.isSupported()) {
          win.audio = document.getElementById('videoplayer') as HTMLMediaElement;
          this.hls = new Hls();
          // bind them together
          this.hls.attachMedia(win.audio);

          this.hls.on(Hls.Events.ERROR, (_event: unknown, data: { fatal: boolean, details: string }) => {
            if (data.fatal) {
              this.stop();
              this.playingError(codeName, data.details);
            }
          });

          this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
            this.hls.loadSource(streamingUrl);
            this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
              setAudioVolume();

              win.audio?.play().then(() => {
                this.playingStarted(
                  options.topic ? options.topic.trim() : null,
                  options.radioOrStreamId ? options.radioOrStreamId.trim() : null,
                  options.source ? options.source.trim() : null,
                );
              });
            });
          });
        }
      });
    } else if (streamingUrl.indexOf('.mpd') !== -1 || (options.force_mpd && options.force_mpd === true)) {
      loadDash().then(() => {
        win.audio = document.getElementById('videoplayer') as HTMLMediaElement;

        this.dash = dashjs.MediaPlayer().create();
        this.dash.initialize(win.audio, streamingUrl, false);

        this.dash.on('error', () => {
          this.stop();
          this.playingError(codeName);
        });

        this.dash.on('canPlay', () => {
          setAudioVolume();

          win.audio?.play().then(() => {
            this.playingStarted(
              options.topic ? options.topic.trim() : null,
              options.radioOrStreamId ? options.radioOrStreamId.trim() : null,
              options.source ? options.source.trim() : null,
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

      // win.audio = new Audio(`${streamUrl}`);
      const audio = document.getElementById('videoplayer') as HTMLMediaElement;
      win.audio = audio;
      audio.src = streamingUrl.trim();
      setAudioVolume();

      audio.onerror = (error) => {
        this.stop();

        // if stream failed and is http we try to switch to our https proxy
        if (streamingUrl.trim().substring(0, 5) !== 'https') {
          this.play(
            streamingUrl,
            codeName,
            { ...options, force_proxy: true }
          );
          return;
        }

        const mediaError = typeof error !== 'string' ? (error.target as HTMLMediaElement | null)?.error : null;
        this.playingError(codeName, mediaError?.message || null);
      };

      audio.play().then(() => {
        this.playingStarted(
          options.topic ? options.topic.trim() : null,
          options.radioOrStreamId ? options.radioOrStreamId.trim() : null,
          options.source ? options.source.trim() : null,
        );
      });
    }
  },
  stop() {
    // cleaning audio objects (and potentially recreating them afterward) is not really necessary
    // as we should have only one player and only one streaming source but let's do it anyway ...
    if (win.audio !== undefined && win.audio !== null) {
      win.audio.pause();
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

    win.audio = null;
    delete win.audio;

    if (this.playing === PLAYER_STATE_PLAYING && this.options.sendStatistics) {
      updateListeningSession(this.radioId, this.playingStart, this.sessionId, true);
      sendGaEvent('stop', 'SSR', this.radioId, 1);
    }

    this.playing = PLAYER_STATE_STOPPED;
    this.radioId = null;
    this.listeningInterval = null;
    this.sessionId = null;
    this.playingStart = null;

    if (!this.initOptions || !this.initOptions.topic || this.initOptions.topic.trim() === '') {
      this.song = null;
      this.cover = null;

      this.leaveChannels();
    }
  },
  playingStarted(topic: string | null, radioOrStreamId: string | null, source: string | null) {
    this.playing = PLAYER_STATE_PLAYING;
    this.lastUpdated = new Date();
    this.playingStart = new Date();

    // For some reason the interval was not set when the code was at the end of this function
    if (this.options.sendStatistics) {
      setTimeout(() => {
        updateListeningSession(this.radioId, this.playingStart, this.sessionId)?.then((data) => {
          if (data && data.id !== null) {
            this.sessionId = data.id;
            this.playingStart = new Date(data.date_time_start);
          }
        });
      }, LISTENING_MIN_INTERVAL);

      // to be sure
      if (this.listeningInterval !== null) {
        clearInterval(this.listeningInterval);
        this.listeningInterval = null;
      }

      this.listeningInterval = setInterval(() => {
        updateListeningSession(this.radioId, this.playingStart, this.sessionId)?.then((data) => {
          if (data && data.id !== null) {
            this.sessionId = data.id;
            this.playingStart = new Date(data.date_time_start);
          }
        });
      }, LISTENING_INTERVAL);

      if (source && SOURCE_INCREMENT_COUNT.indexOf(source) > -1) {
        setTimeout(() => {
          // playing must have stopped
          if (!this.radioId) {
            return;
          }
          incrementPlayCount(this.radioId);
        }, LISTENING_MIN_INTERVAL + 500);
      }
    }

    win.audio?.addEventListener('timeupdate', () => {
      this.lastUpdated = new Date();
    });

    setTimeout(() => {
      if (topic && topic.trim() !== '') {
        this.joinChannel(topic.trim());
      }

      if (radioOrStreamId && radioOrStreamId.trim() !== '') {
        this.joinChannel(`listeners:${radioOrStreamId.trim()}`);
      }
    }, 500);
  },
  initYoutube(el: HTMLElement, streamId: string) {
    loadYoutubeApi().then(() => {
      let errorSent = false;
      let hasPlayed = false;
      let startTimer: ReturnType<typeof setTimeout> | null = null;

      const clearStartTimer = () => {
        if (startTimer !== null) {
          clearTimeout(startTimer);
          startTimer = null;
        }
      };

      const sendError = (errorText: string) => {
        clearStartTimer();

        if (errorSent) {
          return;
        }

        errorSent = true;

        if (this.options.sendStatistics) {
          sendPlayingError(streamId, errorText);
        }
      };

      new YT.Player(el, {
        events: {
          // an unavailable video can fail before we are listening to the player, so onError is never sent:
          // we check the (undocumented) video data once the player is ready
          onReady: (event: any) => {
            const videoData = typeof event.target.getVideoData === 'function' ? event.target.getVideoData() : null;

            if (videoData && (videoData.isPlayable === false || videoData.errorCode)) {
              sendError(`YouTube video unavailable${videoData.errorCode ? ` (${videoData.errorCode})` : ''}`);
            }
          },
          // removed, private or not embeddable video
          onError: (event: { data: number }) => {
            sendError(`YouTube error ${event.data}`);
          },
          // offline live videos usually do not trigger an error, they just never start
          onStateChange: (event: { data: number }) => {
            if (event.data === YT.PlayerState.PLAYING) {
              hasPlayed = true;
              clearStartTimer();
              return;
            }

            // "unstarted" can also be sent without any user action, so it counts only if the player has been clicked
            const isStarting = event.data === YT.PlayerState.BUFFERING
              || (event.data === YT.PlayerState.UNSTARTED && document.activeElement === el);

            if (!isStarting) {
              clearStartTimer();
              return;
            }

            if (hasPlayed || errorSent || startTimer !== null) {
              return;
            }

            startTimer = setTimeout(() => {
              startTimer = null;
              sendError('YouTube video not starting');
            }, YOUTUBE_START_TIMEOUT);
          }
        }
      });
    }).catch(() => {
      // api script blocked or unreachable: nothing to report
    });
  },
  playingError(codeName: string, errorText?: string | null) {
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
        reconnectAfterMs: (tries: number) => {
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
  disconnectSocket() {
    if (this.socket && this.socket.isConnected()) {
      this.socket.disconnect();
    }
  },
  setSocketTimer() {
    // reset if currently one
    this.clearSocketTimer();

    // safeguard, will close socket after n hours
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
  leaveChannels() {
    for (const topicName in this.channels) {
      this.leaveChannel(topicName);
    }
  },
  leaveChannel(channelTopic: string) {
    if (!this.channels[channelTopic]) {
      return;
    }

    this.channels[channelTopic].leave();
    delete this.channels[channelTopic];
    this.listeners = null;

    if (Object.keys(this.channels).length === 0) {
      this.disconnectSocket();
    }
  },
  joinChannel(channelTopic: string) {
    if (!this.options.webSocket) {
      return;
    }

    // optimize listeners channel sub has many people will have the tab running in the background
    if (channelTopic.trim().startsWith('listeners:') && !this.visibilityListeners[channelTopic]) {
      this.visibilityListeners[channelTopic] = true;
      document.addEventListener('visibilitychange', () => {
        if (this.channels[channelTopic] && document.hidden) {
          this.leaveChannel(channelTopic);
        } else {
          this.joinChannel(channelTopic);
        }
      });
    }

    this.connectSocket();

    // Channel already exists?
    if (Object.prototype.hasOwnProperty.call(this.channels, channelTopic)) {
      return;
    }

    this.channels[channelTopic] = this.socket.channel(channelTopic, {});

    this.channels[channelTopic].join()
      .receive('error', (_resp: unknown) => {
        if (channelTopic.startsWith('listeners:')) {
          this.listeners = null;
        } else {
          this.song = null;
          this.cover = null;
          setTitle(null);
        }

        // this.channels[topic] = null;
      })
      .receive('timeout', () => {
        if (channelTopic.startsWith('listeners:')) {
          this.listeners = null;
        } else {
          this.song = null;
          this.cover = null;
          setTitle(null);
        }

        // this.channels[topic] = null;
      });

    this.channels[channelTopic].on('playing', (songData: SongData) => {
      this.formatSong(songData);
      setTitle(this.song);
    });

    // This is not really optimized as we received the song history
    // but only use the event to re-fetch it on PHP the backend,
    // but it avoids building a third song history (after spa & php)
    // TODO revisit later
    this.channels[channelTopic].on('song_history', () => {
      if (!this.initOptions || !this.initOptions.historyUrl) {
        return;
      }

      const historyElem = document.getElementById('song-history');
      if (!historyElem) {
        return;
      }

      fetch(this.initOptions.historyUrl)
        .then((response) => {
          if (response.status !== 200) {
            return null;
          }
          return response.text();
        })
        .then((html) => {
          if (html === null) {
            return;
          }

          // keep the list open if the user expanded it
          const wasExpanded = historyElem.querySelector('#historyDetails.show') !== null;

          historyElem.innerHTML = html;

          if (wasExpanded) {
            historyElem.querySelector('#historyDetails')?.classList.add('show');
            historyElem.querySelector('[data-bs-target="#historyDetails"]')?.setAttribute('aria-expanded', 'true');
            historyElem.querySelector('[data-bs-target="#historyDetails"]')?.classList.remove('collapsed');
          }

          // times are rendered in server timezone, display them in the visitor's one
          const timeFormat = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
          historyElem.querySelectorAll('.song-history-time').forEach((el) => {
            const date = new Date(el.getAttribute('datetime') ?? '');
            if (!Number.isNaN(date.getTime())) {
              // eslint-disable-next-line no-param-reassign
              el.textContent = timeFormat.format(date);
            }
          });
        })
        .catch(() => {});
    });

    this.channels[channelTopic].on('counter_update', (counterData: ListenersData) => {
      this.formatListeners(counterData);
    });

    this.channels[channelTopic].on('quit', () => {
      this.song = null;
      this.cover = null;
      this.listeners = null;
      this.channels[channelTopic] = null;
      delete this.channels[channelTopic];
      setTitle(null);
    });
  },
  formatSong(songData: SongData | null) {
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

    this.fetchItunesCover();
  },
  // when the song has no cover we try to get one from iTunes
  fetchItunesCover() {
    // not when the tab is in the background, the cover is fetched when it is visible again
    if (!this.visibilityListeners.itunesCover) {
      this.visibilityListeners.itunesCover = true;
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          this.fetchItunesCover();
        }
      });
    }

    if (document.hidden || this.song === null || this.cover !== null) {
      return;
    }

    const currentSong = this.song;

    ITunesApi.getCoverUrl(currentSong)
      .then((cover) => {
        // the song may have changed while we were waiting
        if (this.song === currentSong && this.cover === null) {
          this.cover = cover;
        }
      })
      .catch(() => {});
  },
  formatListeners(listenersData: ListenersData | null) {
    if (!listenersData || !listenersData.listeners) {
      this.listeners = null;
      return;
    }

    this.listeners = listenersData.listeners;
  },
  // chat
  openChat(topic: string) {
    const chatModal = document.getElementById('chatModal');
    if (!chatModal) {
      return;
    }

    const chatTopic = `chat:${topic}`;
    // this.joinChatChannel(chatTopic);
    // used by sendMessage() & updateName(), which do nothing without it
    this.currentChatTopic = chatTopic;

    // messages received while the modal was hidden: the list can't be scrolled until it is displayed
    chatModal.addEventListener('shown.bs.modal', () => {
      this.scrollChatToBottom();
      // autofocus has no effect in Bootstrap modals (it focuses the modal itself once shown)
      chatModal.querySelector<HTMLInputElement>('input[name="message"]')?.focus();
    }, { once: true });
    // any dismiss: close button, Escape, backdrop click (fired once the hide transition is over).
    // once: a new listener is added at each opening
    chatModal.addEventListener('hidden.bs.modal', () => {
      this.modalShown = false;
      this.hasNewMessages = false;
    }, { once: true });

    // reuses the instance created by a previous click (or by data-bs-toggle), new Modal() doesn't show it
    bootstrap.Modal.getOrCreateInstance(chatModal).show();
    this.modalShown = true;
    this.hasNewMessages = false;
  },
  leaveChatChannels() {
    Object.keys(this.chatChannels).forEach((topicName) => {
      this.leaveChatChannel(topicName);
    });
  },
  leaveChatChannel(channelTopic: string) {
    if (!this.chatChannels[channelTopic]) {
      return;
    }

    this.chatChannels[channelTopic].leave();
    delete this.chatChannels[channelTopic];

    /* if (Object.keys(this.channels).length === 0) {
      this.disconnectSocket();
    } */
  },
  joinChatChannel(channelTopic: string) {
    this.connectSocket();

    // Channel already exists?
    if (this.socket === null
      || Object.prototype.hasOwnProperty.call(this.chatChannels, channelTopic)) {
      return;
    }

    // params as a function so a rejoin (after a reconnection) sends the current name
    const channel = this.socket.channel(channelTopic, () => ({ name: this.name }));
    this.chatChannels[channelTopic] = channel;

    // listens to "presence_state" & "presence_diff" sent by the server
    const presence = new Presence(channel);
    presence.onSync(() => {
      // presence.js is untyped, list() returns the mapped array
      const participants = presence.list(
        (key: string, { metas }: { metas: ParticipantMeta[] }) => ({ key, name: metas[0].name })
      ) as unknown as ChatParticipant[];

      this.participants = participants.sort((a, b) => a.name.localeCompare(b.name));
    });

    channel.join()
      .receive('ok', (resp: { key: string, messages?: ChatMessage[] }) => {
        this.presenceKey = resp.key;
        this.receiveHistory(resp.messages ?? []);
      })
      .receive('error', () => {
        // this.chatChannels[topic] = null;
      })
      .receive('timeout', () => {
        // this.chatChannels[topic] = null;
      });

    channel.on('new:msg', (msgData: ChatMessage) => {
      this.receiveMessage(msgData);
    });
  },
  sendMessage() {
    if (!this.name || this.name === '' || !this.currentChatTopic || !this.chatChannels[this.currentChatTopic]) {
      return;
    }

    const msg = this.newMessage.trim();

    if (msg === '') {
      return;
    }

    // broadcast to everyone with the message, large range to avoid collisions between users
    const ctrl = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    this.msgCtrls.push(ctrl);
    // same limit as the messages: the own messages still displayed always have their ctrl kept
    keepLast(this.msgCtrls, CHAT_MAX_MESSAGES);

    // displayed immediately, replaced by the channel one when (and if) it arrives
    this.messages.push({
      id: `${ctrl}`,
      user: this.name,
      msg,
      datetime: new Date().toISOString(),
      ctrl,
    });
    keepLast(this.messages, CHAT_MAX_MESSAGES);
    this.scrollChatToBottom();

    // the name is set by the server from the presence
    this.chatChannels[this.currentChatTopic].push('new:msg', {
      msg,
      ctrl
    });

    this.newMessage = '';
  },
  // follows the last message, after the list has been rendered
  scrollChatToBottom() {
    nextTick(() => {
      const list = document.querySelector<HTMLElement>('#chatModal .chat-messages');

      if (list) {
        list.scrollTop = list.scrollHeight;
      }
    });
  },
  // last messages of the chat, sent on join. Also on a rejoin after a reconnection:
  // merged with the displayed ones, to keep them and get the ones missed meanwhile
  receiveHistory(history: ChatMessage[]) {
    const ids = new Set(this.messages.map((message: ChatMessage) => message.id));
    const missing = history.filter((message: ChatMessage) => !ids.has(message.id));

    if (missing.length === 0) {
      return;
    }

    // sort is stable: the same datetime (server ones are truncated to the second) keeps the order
    this.messages = [...missing, ...this.messages]
      .sort((a, b) => Date.parse(a.datetime) - Date.parse(b.datetime));
    keepLast(this.messages, CHAT_MAX_MESSAGES);
    this.scrollChatToBottom();
  },
  receiveMessage(message: ChatMessage) {
    // already received with the history of the join
    if (this.messages.some((localMessage: ChatMessage) => localMessage.id === message.id)) {
      return;
    }

    // own message already displayed locally: replaced in place
    if (this.isOwnMessage(message)) {
      const localIndex = this.messages.findIndex(
        (localMessage: ChatMessage) => localMessage.id === `${message.ctrl}`
      );

      if (localIndex !== -1) {
        this.messages[localIndex] = message;
        return;
      }
    }

    this.messages.push(message);
    if (!this.modalShown) {
      this.hasNewMessages = true;
    }
    keepLast(this.messages, CHAT_MAX_MESSAGES);
    this.scrollChatToBottom();
  },
  // exposed to the templates, which only see the app properties
  formatTime,
  isOwnMessage(message: ChatMessage) {
    return this.msgCtrls.includes(message.ctrl);
  },
  updateName() {
    const name = this.name.trim().slice(0, CHAT_NAME_MAX_LENGTH);

    if (name === '') {
      return;
    }

    saveName(name);

    if (!this.currentChatTopic || !this.chatChannels[this.currentChatTopic]) {
      return;
    }

    this.chatChannels[this.currentChatTopic].push('update:name', { name })
      .receive('ok', (resp: { name: string }) => {
        // the server may have altered it
        this.name = resp.name;
        saveName(resp.name);
      });
  },
}).mount();
