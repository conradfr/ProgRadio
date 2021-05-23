export const MINUTE_PIXEL = 6;
export const DAYS = 1;
export const GRID_VIEW_EXTRA = 50;
export const GRID_VIEW_EXTRA_LEFT = 76;
export const RADIO_MENU_WIDTH = 71;

export const GRID_INDEX_BREAK = 768;
export const NAV_MOVE_BY = 60 * MINUTE_PIXEL;
export const TICK_INTERVAL = 30000; /* ms */

export const THUMBNAIL_PROGRAM_PATH = '/media/cache/program_thumb/media/program/';
export const THUMBNAIL_PAGE_PROGRAM_PATH = '/media/cache/page_thumb/media/program/';
export const THUMBNAIL_NOTIFICATION_PROGRAM_PATH = '/media/cache/notification_thumb/media/program/';
export const THUMBNAIL_STREAM_PATH = '/media/stream/';
export const THUMBNAIL_PAGE_PATH = '/img/radio/page/';
export const PROGRAM_LONG_ENOUGH = 45; /* minutes */

export const DEFAULT_VOLUME = 8;
export const DEFAULT_TIMER_MINUTES = 15;

export const DEFAULT_COLLECTION = 'nationwide';

export const COLLECTION_FAVORITES = 'favorites';

export const CACHE_KEY_RADIOS = 'radios_v3';
export const CACHE_KEY_COLLECTIONS = 'collections_v3';
export const CACHE_KEY_CATEGORIES = 'categories_v3';
export const CACHE_KEY_RADIO_FAVORITES = 'radio_favorites_v3';
export const CACHE_KEY_STREAM_FAVORITES = 'stream_favorites_v3';

export const COOKIE_PREFIX = 'progradio';
export const COOKIE_TTL = '1Y';

export const COOKIE_EXCLUDE = `${COOKIE_PREFIX}-exclude`;
export const COOKIE_COLLECTION = `${COOKIE_PREFIX}-collection_v2`;
export const COOKIE_VOLUME = `${COOKIE_PREFIX}-volume`;
export const COOKIE_MUTED = `${COOKIE_PREFIX}-muted`;
export const COOKIE_LAST_RADIO_PLAYED = `${COOKIE_PREFIX}-lastplayed`;
export const COOKIE_LAST_RADIO_STREAM_PLAYED = `${COOKIE_PREFIX}-stream-lastplayed`;
export const COOKIE_RADIO_FAVORITES = `${COOKIE_PREFIX}-${COLLECTION_FAVORITES}`;
export const COOKIE_STREAM_FAVORITES = `${COOKIE_PREFIX}-${COLLECTION_FAVORITES}_streams`;
export const COOKIE_STREAM_COUNTRY = `${COOKIE_PREFIX}-stream-country`;
export const COOKIE_STREAM_SORT = `${COOKIE_PREFIX}-stream-sort`;
export const COOKIE_STREAM_RADIOBROWSER_API = `${COOKIE_PREFIX}-stream-radiobrowser_api`;
export const COOKIE_LAST_TIMER = `${COOKIE_PREFIX}-timer`;

export const COOKIE_PARAMS = { expires: COOKIE_TTL, secure: true, samesite: 'Lax' };

export const TIMEZONE = 'Europe/Paris';

export const TOAST_POSITION = 'top-right';
export const TOAST_DURATION = 3000; /* ms */
export const TOAST_TYPE_ERROR = 'error';
export const TOAST_TYPE_INFO = 'success';

export const PLAYER_NOTIFICATION_ID = 'progradio-play';
export const PLAYER_NOTIFICATION_LENGTH = 3000; /* ms */

export const PLAYER_TYPE_RADIO = 'radio';
export const PLAYER_TYPE_STREAM = 'stream';

export const PLAYER_TYPE_CHECK_INTERVAL = 2500; /* ms */
export const PLAYER_TYPE_CHECK_TIMEOUT = 7000; /* ms */

export const LISTENING_SESSION_MIN_SECONDS = 30;
export const LISTENING_SESSION_SOURCE = 'web';

export const AUTOPLAY_INTERVAL_CHECK = 100;
export const AUTOPLAY_INTERVAL_MAX_RETRIES = 50;

export const STREAMS_DEFAULT_PER_PAGE = 35;
export const STREAMS_MAX_PAGES_DISPLAY = 9;

export const STREAMING_CATEGORY_ALL = 'ALL';
export const STREAMING_CATEGORY_FAVORITES = 'FAVORITES';

export const PLAYER_STATE_NONE = 0;
export const PLAYER_STATE_STOPPED = 1;
export const PLAYER_STATE_PAUSED = 2;
export const PLAYER_STATE_PLAYING = 3;
export const PLAYER_STATE_ERROR = 7;

export const PLAYER_STATE = [
  PLAYER_STATE_NONE,
  PLAYER_STATE_STOPPED,
  PLAYER_STATE_PAUSED,
  PLAYER_STATE_PLAYING,
  PLAYER_STATE_ERROR
];

// ----- GTAG -----

// cross

export const GTAG_ACTION_PLAY = 'play';
export const GTAG_ACTION_STOP = 'pause';
export const GTAG_ACTION_TOGGLE_PLAY = 'toggle_play';

export const GTAG_ACTION_PLAY_VALUE = 3;
export const GTAG_ACTION_STOP_VALUE = 1;
export const GTAG_ACTION_TOGGLE_PLAY_VALUE = 2;

export const GTAG_ACTION_FAVORITE_TOGGLE = 'favorite_toggle';
export const GTAG_ACTION_FAVORITE_TOGGLE_VALUE = 2;

// categories

export const GTAG_CATEGORY_SCHEDULE = 'schedule';
export const GTAG_SCHEDULE_ACTION_COLLECTION_NAVIGATION = 'collection_navigation';
export const GTAG_SCHEDULE_COLLECTION_NAVIGATION_VALUE = 1;
export const GTAG_SCHEDULE_ACTION_FILTER = 'filter';
export const GTAG_SCHEDULE_FILTER_VALUE = 1;

export const GTAG_CATEGORY_STREAMING = 'streaming';
export const GTAG_STREAMING_ACTION_FILTER_COUNTRY = 'filter_country';
export const GTAG_STREAMING_ACTION_FILTER_SORT = 'filter_sort';
export const GTAG_ACTION_PLAY_RANDOM = 'play_random';
export const GTAG_ACTION_SEARCH_BUTTON = 'streaming_search';
export const GTAG_STREAMING_FILTER_VALUE = 1;

export const GTAG_CATEGORY_PLAYER = 'player';
export const GTAG_CATEGORY_TIMER = 'timer';

export const GTAG_CATEGORY_RADIOPAGE = 'radio_page';
export const GTAG_CATEGORY_NOWPAGE = 'now_page';

// timer

export const GTAG_ACTION_TIMER_SET = 'timer_set';
export const GTAG_ACTION_TIMER_QUICK_SET = 'timer_quick_set';
export const GTAG_ACTION_TIMER_ADD = 'timer_add';
export const GTAG_ACTION_TIMER_CANCEL = 'timer_cancel';

// Android

export const ANDROID_TIMER_MIN_VERSION = 16;
