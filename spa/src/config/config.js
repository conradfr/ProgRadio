export const MINUTE_PIXEL = 6;
export const DAYS = 1;
export const GRID_VIEW_EXTRA = 50;
export const GRID_VIEW_EXTRA_LEFT = 76;
export const RADIO_MENU_WIDTH = 71;

export const GRID_INDEX_BREAK = 768;
export const NAV_MOVE_BY = 60 * MINUTE_PIXEL;
export const TICK_INTERVAL = 30000; /* ms */

// eslint-disable-next-line max-len
export const POPUP_SETTINGS = 'scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,width=600,height=250,left=150,top=150';
export const POPUP_URL_WILDCARD = '123';

export const THUMBNAIL_PROGRAM_PATH = 'media/cache/program_thumb/media/program/';
export const THUMBNAIL_PAGE_PROGRAM_PATH = 'media/cache/page_thumb/media/program/';
export const THUMBNAIL_NOTIFICATION_PROGRAM_PATH = 'media/cache/notification_thumb/media/program/';
export const THUMBNAIL_STREAM_PATH = 'media/stream/';
export const THUMBNAIL_PAGE_PATH = 'img/radio/page/';
export const THUMBNAIL_STREAM_PLACEHOLDER = 'img/stream-placeholder.png';
export const PROGRAM_LONG_ENOUGH = 45; /* minutes */

export const DEFAULT_VOLUME = 8;
export const DEFAULT_TIMER_MINUTES = 20;

export const MOBILE_MENU_TIMER_CLASSNAME = 'nav-link-timer';

export const DEFAULT_COLLECTION = 'nationwide';
export const COLLECTION_FAVORITES = 'favorites';
export const COLLECTION_EXCLUDED_FROM_ALL = ['favorites', 'francebleu'];
export const COLLECTION_ALL = 'all';

export const RADIO_LIST_IGNORE_COUNTRY = 'FR';

export const CACHE_KEY_RADIOS = 'radios_v2';
export const CACHE_KEY_COLLECTIONS = 'collections';
export const CACHE_KEY_CATEGORIES = 'categories';
export const CACHE_KEY_RADIO_FAVORITES = 'radio_favorites';
export const CACHE_KEY_STREAM_FAVORITES = 'stream_favorites';
export const CACHE_KEY_STREAM_COUNTRIES = 'stream_countries';

export const LAST_RADIO_PLAYED = 'lastplayed';
export const LAST_RADIO_STREAM_PLAYED = 'stream-lastplayed';
export const PREV_RADIO_PLAYED = 'prevplayed';
export const PREV_RADIO_STREAM_PLAYED = 'stream-prevplayed';

export const COOKIE_PREFIX = 'progradio_v4';
export const COOKIE_TTL = '31536000';
export const COOKIE_PARAMS = {
  path: '/',
  'max-age': COOKIE_TTL,
  expires: 'mage-age',
  secure: true,
  SameSite: 'Lax'
};

export const COOKIE_EXCLUDE = `${COOKIE_PREFIX}-exclude`;
export const COOKIE_PREROLL_EXCLUDED = `${COOKIE_PREFIX}-preroll_excluded`;
export const COOKIE_COLLECTION = `${COOKIE_PREFIX}-collection`;
export const COOKIE_VOLUME = `${COOKIE_PREFIX}-volume`;
export const COOKIE_MUTED = `${COOKIE_PREFIX}-muted`;
export const COOKIE_HOME = 'progradio-home';
export const COOKIE_RADIO_FAVORITES = `${COOKIE_PREFIX}-${COLLECTION_FAVORITES}`;
export const COOKIE_SUBRADIOS = `${COOKIE_PREFIX}-subradios`;
export const COOKIE_STREAM_FAVORITES = `${COOKIE_PREFIX}-${COLLECTION_FAVORITES}_streams`;
export const COOKIE_STREAM_COUNTRY = `${COOKIE_PREFIX}-stream-country-3`;
export const COOKIE_STREAM_SORT = `${COOKIE_PREFIX}-stream-sort-3`;
export const COOKIE_STREAM_RADIOBROWSER_API = `${COOKIE_PREFIX}-stream-radiobrowser_api`;
export const COOKIE_LAST_TIMER = `${COOKIE_PREFIX}-timer`;
export const COOKIE_TOOLTIP_COLLECTION = `${COOKIE_PREFIX}-tooltip-collection`;
export const COOKIE_TOOLTIP_TIMER = `${COOKIE_PREFIX}-tooltip-timer`;
export const COOKIE_PLAYER_FLUX = `${COOKIE_PREFIX}-player-flux`;
export const COOKIE_PLAYER_FLUX_DURATION = `${COOKIE_PREFIX}-player-flux-duration`;
export const COOKIE_EXPAND_PLAYER = `${COOKIE_PREFIX}-expand-player`;
export const COOKIE_TOOLTIP_SHOW_MS = 3500;

export const TIMEZONE = 'Europe/Paris';

export const TOAST_DURATION = 3500; /* ms */
export const TOAST_TYPE_ERROR = 'error';
export const TOAST_TYPE_INFO = 'success';

export const PLAYER_NOTIFICATION_ID = 'progradio-play';
export const PLAYER_NOTIFICATION_LENGTH = 3000; /* ms */

export const PLAYER_TYPE_RADIO = 'radio';
export const PLAYER_TYPE_STREAM = 'stream';

export const WEBSOCKET_DISCONNECT_AFTER = 36000000; /* 10h in ms */
export const WEBSOCKET_MAX_RETRIES = 50;
export const WEBSOCKET_HEARTBEAT = 50000; /* ms */

export const LISTENING_SESSION_MIN_SECONDS = 15;
export const LISTENING_SESSION_SOURCE = 'web';
export const LISTENING_SESSION_SOURCE_SSR = 'seo';

export const STREAMS_DEFAULT_PER_PAGE = 48;
// export const STREAMS_MAX_PAGES_DISPLAY = 9;

export const STREAMING_CATEGORY_ALL = 'ALL';
export const STREAMING_CATEGORY_FAVORITES = 'FAVORITES';
export const STREAMING_CATEGORY_HISTORY = 'HISTORY';
export const STREAMING_CATEGORY_LAST = 'LAST';

export const STREAMING_SORT_USER_LAST = 'user_last';
export const STREAMING_DEFAULT_SORT = 'popularity';

export const STREAMING_SEARCH_DELAY_BEFORE_SEND = 2500;

export const PLAYER_MAX_SECONDS_TO_STOP = 3;

export const PLAYER_STOP_DELAY_HIGH_BANDWIDTH_THRESHOLD_MBPS = 1;
export const PLAYER_STOP_DELAY_LOWER_BANDWIDTH_THRESHOLD_MBPS = 0.5;

export const PLAYER_STOP_DELAY_HIGH_BANDWIDTH_MS = 1800000; // 30mn
export const PLAYER_STOP_DELAY_LOWER_BANDWIDTH_MS = 600000; // 10mn

export const PLAYER_MULTI_ALLOWED_TYPE = '4g';
export const PLAYER_MULTI_DISABLED_TYPE = 'cellular';

// from https://developer.android.com/reference/android/media/session/PlaybackState
export const PLAYER_STATE_NONE = 0;
export const PLAYER_STATE_STOPPED = 1;
export const PLAYER_STATE_PAUSED = 2;
export const PLAYER_STATE_PLAYING = 3;
export const PLAYER_STATE_BUFFERING = 6;
// export const PLAYER_STATE_CONNECTING = 8;
export const PLAYER_STATE_ERROR = 7;

// extends Android Playback state
export const PLAYER_STATE_LOADING = 42;

export const PLAYER_STATE = [
  PLAYER_STATE_NONE,
  PLAYER_STATE_STOPPED,
  PLAYER_STATE_PAUSED,
  PLAYER_STATE_PLAYING,
  PLAYER_STATE_ERROR
];

export const PROGRADIO_AGENT = 'programmes-radio.com';
export const RADIOADDICT_AGENT = 'radio-addict.com';

// ----- GTAG -----

// cross

export const GTAG_ACTION_PLAY = 'play';
export const GTAG_ACTION_STOP = 'pause';
export const GTAG_ACTION_TOGGLE_PLAY = 'toggle_play';
export const GTAG_ACTION_TOGGLE_PREVIOUS = 'toggle_previous';

export const GTAG_ACTION_PLAY_VALUE = 3;
export const GTAG_ACTION_STOP_VALUE = 1;
export const GTAG_ACTION_TOGGLE_PLAY_VALUE = 2;
export const GTAG_ACTION_TOGGLE_PREVIOUS_VALUE = 1;

export const GTAG_ACTION_FAVORITE_TOGGLE = 'favorite_toggle';
export const GTAG_ACTION_FAVORITE_TOGGLE_VALUE = 2;

export const GTAG_ACTION_PROGRAM_DETAIL = 'program_detail';
export const GTAG_ACTION_PROGRAM_DETAIL_VALUE = 1;

export const GTAG_ACTION_REGION_VALUE = 1;

// categories

export const GTAG_CATEGORY_SCHEDULE = 'schedule';
export const GTAG_SCHEDULE_ACTION_COLLECTION_NAVIGATION = 'collection_navigation';
export const GTAG_SCHEDULE_COLLECTION_NAVIGATION_VALUE = 1;
export const GTAG_SCHEDULE_ACTION_FILTER = 'filter';
export const GTAG_SCHEDULE_FILTER_VALUE = 1;

export const GTAG_CATEGORY_STREAMING = 'streaming';
export const GTAG_STREAMING_ACTION_FILTER_COUNTRY = 'filter_country';
export const GTAG_STREAMING_ACTION_FILTER_SORT = 'filter_sort';
export const GTAG_STREAMING_ACTION_TAG = 'tag_click';
export const GTAG_STREAMING_ACTION_GEOLOC = 'geoloc';
export const GTAG_STREAMING_ACTION_SWITCH_TO_FAVORITES = 'switch_to_favorites';
export const GTAG_ACTION_PLAY_RANDOM = 'play_random';
export const GTAG_ACTION_SEARCH_BUTTON = 'streaming_search';
export const GTAG_STREAMING_FILTER_VALUE = 1;

export const GTAG_CATEGORY_PLAYER = 'player';
export const GTAG_CATEGORY_TIMER = 'timer';

export const GTAG_CATEGORY_RADIOPAGE = 'radio_page';
export const GTAG_CATEGORY_NOWPAGE = 'now_page';
export const GTAG_CATEGORY_SONGS = 'songs_page';
export const GTAG_CATEGORY_MENU = 'menu';

// timer

export const GTAG_ACTION_TIMER_SET = 'timer_set';
export const GTAG_ACTION_TIMER_QUICK_SET = 'timer_quick_set';
export const GTAG_ACTION_TIMER_ADD = 'timer_add';
export const GTAG_ACTION_TIMER_CANCEL = 'timer_cancel';

// song

export const GTAG_ACTION_SAVE_SONG = 'save_song';
export const GTAG_ACTION_SAVE_SONG_VALUE = 2;
export const GTAG_ACTION_REMOVE_SONG = 'remove_song';
export const GTAG_ACTION_REMOVE_SONG_VALUE = 1;

// region

export const GTAG_ACTION_REGION_CLICK = 'region_click';
export const GTAG_ACTION_REGION_SELECT = 'region_select';

// set home

export const GTAG_ACTION_HOME_SET = 'timer_set';
export const GTAG_ACTION_HOME_REMOVE = 'timer_quick_set';
export const GTAG_ACTION_HOME_VALUE = 1;

// output

export const GTAG_ACTION_OUTPUT_CHANGE = 'change_output';
export const GTAG_ACTION_OUTPUT_VALUE = 1;

// expanded player

export const GTAG_ACTION_PLAYER_EXPAND = 'player_expand';
export const GTAG_ACTION_PLAYER_EXPAND_VALUE = 1;

// Android

export const ANDROID_SONG_MIN_VERSION = 26;
export const ANDROID_CHANNEL_IN_LIST_MIN_VERSION = 27;
