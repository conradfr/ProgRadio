// one-shotted by Claude

import axios from 'axios';
import * as cheerio from 'cheerio';
import moment from 'moment-timezone';
import logger from '../../lib/logger.js';

const baseUrl = 'https://pyreneesfm.com';

const dayFrInv = {
  1: 'lundi',
  2: 'mardi',
  3: 'mercredi',
  4: 'jeudi',
  5: 'vendredi',
  6: 'samedi',
  7: 'dimanche'
};

let scrapedData = [];

/**
 * The page is a Next.js app router page: the schedule is serialized in the RSC
 * flight payload pushed by the inline `self.__next_f.push([1, "…"])` scripts.
 * Their `type` attribute is rewritten by Cloudflare Rocket Loader with a token
 * that changes on every request, so the scripts are matched on their content.
 */
const getFlightPayload = ($) => {
  return $('script:not([src])')
    .toArray()
    .map((el) => $(el).text())
    .filter((code) => code.includes('self.__next_f.push'))
    .flatMap((code) => [...code.matchAll(/self\.__next_f\.push\(\[1,("(?:\\.|[^"\\])*")/g)])
    .map((match) => JSON.parse(match[1]))
    .join('');
};

/**
 * Reads the JSON object that follows `"schedule":` in the flight payload,
 * by matching braces while ignoring the ones inside strings.
 */
const extractSchedule = (payload) => {
  const start = payload.indexOf('"schedule":{');
  if (start === -1) {
    return null;
  }

  const from = payload.indexOf('{', start);
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = from; i < payload.length; i++) {
    const char = payload[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
    } else if (char === '{') {
      depth++;
    } else if (char === '}') {
      depth--;
      if (depth === 0) {
        try {
          return JSON.parse(payload.substring(from, i + 1));
        } catch (error) {
          logger.log('error', 'unable to parse the schedule payload');
          return null;
        }
      }
    }
  }

  return null;
};

const format = (dateObj) => {
  return scrapedData.reduce((prev, entry) => {
    if (entry.startMin === undefined || entry.endMin === undefined || !entry.name) {
      return prev;
    }

    const startDateTime = moment(dateObj).startOf('day').add(entry.startMin, 'minutes');
    const endDateTime = moment(dateObj).startOf('day').add(entry.endMin, 'minutes');

    const newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString(),
      'title': entry.name.trim(),
      'img': entry.image ? `${baseUrl}${entry.image}` : null,
    };

    if (entry.host) {
      newEntry.host = entry.host.trim();
    }

    if (entry.slogan) {
      newEntry.description = entry.slogan.trim();
    }

    prev.push(newEntry);
    return prev;
  }, []);
};

const fetch = async (dateObj) => {
  const url = `${baseUrl}/radio`;

  logger.log('info', `fetching ${url}`);

  const response = await axios.get(url);
  const $ = cheerio.load(response.data);

  const schedule = extractSchedule(getFlightPayload($));
  const day = dayFrInv[dateObj.isoWeekday()];

  scrapedData = (schedule && schedule[day]) || [];

  return Promise.resolve(true);
};

const fetchAll = (dateObj) => {
  return fetch(dateObj);
};

const getScrap = (dateObj) => {
  scrapedData = [];
  dateObj.tz('Europe/Paris');
  return fetchAll(dateObj)
    .then(() => {
      return format(dateObj);
    });
};

export default {
  getName: 'pyreneesfm',
  supportTomorrow: true,
  getScrap
};
