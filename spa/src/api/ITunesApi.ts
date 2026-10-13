import cache from '@/utils/cache';

import {
  CACHE_KEY_ITUNES_PREFIX
} from '@/config/config';

// we only keep what we use, to not fill the session storage
type ITunesResult = {
  artworkUrl100: string|null,
  artworkUrl60: string|null,
  artworkUrl30: string|null,
  trackViewUrl: string|null
};

// searches in progress, so asking the cover and the link of a song at the same time does only one call
const pending: Record<string, Promise<ITunesResult|null>> = {};

const fetchSong = async (song: string, cacheKey: string): Promise<ITunesResult|null> => {
  const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(song)}&entity=song&limit=1`);
  const data = await response.json();

  let result: ITunesResult|null = null;
  if (data && data.resultCount && data.resultCount > 0) {
    result = {
      artworkUrl100: data.results[0].artworkUrl100 || null,
      artworkUrl60: data.results[0].artworkUrl60 || null,
      artworkUrl30: data.results[0].artworkUrl30 || null,
      trackViewUrl: data.results[0].trackViewUrl || null
    };
  }

  // songs not found are cached too (as null), to not search them again
  cache.setSessionCache(cacheKey, result);

  return result;
};

const getSong = async (song: string): Promise<ITunesResult|null> => {
  // no hash of the song: it would add a hash library to the mini player, inlined in the pages
  const cacheKey = `${CACHE_KEY_ITUNES_PREFIX}_${song}`;

  if (cache.hasSessionCache(cacheKey)) {
    return cache.getSessionCache(cacheKey);
  }

  if (!pending[cacheKey]) {
    pending[cacheKey] = fetchSong(song, cacheKey).finally(() => {
      delete pending[cacheKey];
    });
  }

  return pending[cacheKey];
};

const getCoverUrl = async (song: string):  Promise<string|null> => {
  const result = await getSong(song);

  return result?.artworkUrl100 || result?.artworkUrl60 || result?.artworkUrl30 || null;
};

const getItunesLink = async (song: string):  Promise<string|null> => {
  const result = await getSong(song);

  return result?.trackViewUrl || null;
};

export default {
  getCoverUrl,
  getItunesLink
};
