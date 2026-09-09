"use strict";

import axios from 'axios';
import logger from './logger.js';

// 0 disables the cache.
// 5mn
const defaultTtl = 300;
// The cache only lives for the duration of a run, but a run can touch a few
// hundred pages, so keep the retained html bounded.
const maxEntries = 1000;

const entries = new Map();

// Kill switch, e.g. SCRAPER_HTTP_CACHE_TTL=0 to bypass the cache everywhere.
const getTtl = (ttl) => {
  const parsed = parseInt(ttl, 10);

  return Number.isNaN(parsed) ? ttl : parsed;
};

const sweep = () => {
  const now = Date.now();

  for (const [key, entry] of entries) {
    if (entry.expiresAt <= now) {
      entries.delete(key);
    }
  }

  // a Map iterates in insertion order, so this drops the oldest entries first
  while (entries.size >= maxEntries) {
    entries.delete(entries.keys().next().value);
  }
};

/**
 * Fetches an url, optionally caching its body for `ttl` seconds.
 *
 * The promise is cached rather than the resolved body: concurrent callers then
 * await the same in-flight request instead of each firing their own, which is
 * where most of the duplication happens as radios are scraped in parallel.
 */
const fetchUrl = async (url, ttl = defaultTtl) => {
  const seconds = getTtl(ttl);

  if (seconds <= 0) {
    const response = await axios.get(url);
    return response.data;
  }

  const cached = entries.get(url);

  if (cached !== undefined && cached.expiresAt > Date.now()) {
    logger.log('debug', `cache hit ${url}`);
    return cached.promise;
  }

  const entry = {
    promise: axios.get(url).then((response) => response.data),
    expiresAt: Date.now() + (seconds * 1000)
  };

  // a failed request must not be pinned for the whole ttl
  entry.promise.catch(() => {
    if (entries.get(url) === entry) {
      entries.delete(url);
    }
  });

  sweep();
  entries.set(url, entry);

  return entry.promise;
};

const clear = () => {
  entries.clear();
};

export default {
  fetchUrl,
  clear
};
