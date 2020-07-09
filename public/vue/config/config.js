export const MINUTE_PIXEL = 6;
export const DAYS = 1;
export const GRID_VIEW_EXTRA = 50;
export const GRID_VIEW_EXTRA_LEFT = 76;

export const GRID_INDEX_BREAK = 768;
export const NAV_MOVE_BY = 60 * MINUTE_PIXEL;
export const TICK_INTERVAL = 30000; /* one minute in ms */

export const THUMBNAIL_PROGRAM_PATH = '/media/cache/program_thumb/media/program/';
export const THUMBNAIL_STREAM_PATH = '/media/stream/';
export const PROGRAM_LONG_ENOUGH = 45; /* minutes */

export const DEFAULT_VOLUME = 8;

export const COLLECTION_FAVORITES = 'favorites';

export const COOKIE_PREFIX = 'progradio';
export const COOKIE_TTL = '1Y';

export const COOKIE_EXCLUDE = `${COOKIE_PREFIX}-exclude`;
export const COOKIE_COLLECTION = `${COOKIE_PREFIX}-collection`;
export const COOKIE_VOLUME = `${COOKIE_PREFIX}-volume`;
export const COOKIE_MUTED = `${COOKIE_PREFIX}-muted`;
export const COOKIE_LAST_RADIO_PLAYED = `${COOKIE_PREFIX}-lastplayed`;
export const COOKIE_FAVORITES = `${COOKIE_PREFIX}-${COLLECTION_FAVORITES}`;
export const COOKIE_STREAM_COUNTRY = `${COOKIE_PREFIX}-stream-country`;
export const COOKIE_STREAM_SORT = `${COOKIE_PREFIX}-stream-sort`;

export const COOKIE_PARAMS = { expires: COOKIE_TTL, secure: true, samesite: 'Lax' };

export const TIMEZONE = 'Europe/Paris';

export const DEFAULT_COLLECTION = 'nationwide';

export const PLAYER_NOTIFICATION_ID = 'progradio-play';
export const PLAYER_NOTIFICATION_LENGTH = 3000; // ms

export const STREAMS_DEFAULT_PER_PAGE = 35;
export const STREAMS_MAX_PAGES_DISPLAY = 9;

export const PLAYER_TYPE_RADIO = 'radio';
export const PLAYER_TYPE_STREAM = 'stream';

// ----- GTAG -----

export const GTAG_CATEGORY_SCHEDULE = 'schedule';
export const GTAG_SCHEDULE_ACTION_CATEGORY_NAVIGATION = 'category_navigation';
export const GTAG_SCHEDULE_CATEGORY_NAVIGATION_VALUE = 0.5;
export const GTAG_SCHEDULE_ACTION_PLAY = 'play';
export const GTAG_SCHEDULE_PLAY_VALUE = 1;
export const GTAG_SCHEDULE_ACTION_FILTER = 'filter';
export const GTAG_SCHEDULE_FILTER_VALUE = 1;
export const GTAG_SCHEDULE_ACTION_FAVORITE_TOGGLE = 'favorite_toggle';
export const GTAG_SCHEDULE_FAVORITE_TOGGLE_VALUE = 0.7;

export const GTAG_CATEGORY_STREAMING = 'streaming';
export const GTAG_STREAMING_ACTION_FILTER_COUNTRY = 'filter_country';
export const GTAG_STREAMING_ACTION_FILTER_SORT = 'filter_sort';
export const GTAG_STREAMING_ACTION_PLAY_RANDOM = 'play_random';
export const GTAG_STREAMING_ACTION_PLAY = 'play';
export const GTAG_STREAMING_FILTER_VALUE = 0.5;
export const GTAG_STREAMING_PLAY_VALUE = 1;
