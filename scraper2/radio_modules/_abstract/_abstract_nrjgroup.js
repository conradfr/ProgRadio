import axios from 'axios';
import * as cheerio from 'cheerio';
import moment from 'moment-timezone';
import utils from '../../lib/utils.js';
import logger from '../../lib/logger.js';

let scraperConfig = {};
const scrapedData = {};
const cleanedData = {};

const format = async (dateObj, name) => {
// we use reduce instead of map to act as a map+filter in one pass
  cleanedData[name] = scrapedData[name].reduce(function (prev, curr, index, array) {
    const startDateTime = moment.tz(curr.datetime_raw_start, 'YYYY-MM-DDTHH:mm:ss', 'Europe/Paris');
    const endDateTime = moment.tz(curr.datetime_raw_end, 'YYYY-MM-DDTHH:mm:ss', 'Europe/Paris');

    if (startDateTime.isAfter(dateObj, 'day')) {
      startDateTime.subtract(7, 'days');
    }

    if (endDateTime.isAfter(dateObj, 'day')) {
      endDateTime.subtract(7, 'days');
    }

    // if (previous day is sunday we need to sub 7 days)
    // if (dateObj.day() === 1 && startDateTime.day() !== dateObj.day()) {
    //   startDateTime.subtract(7, 'days');
    //   endDateTime.subtract(7, 'days');
    // }
    // keep only relevant time from previous day page

    // NOTE: there is a bug in the page, all datetimes on it have the day date even if next day,
    //       so we need to account for that

    // if (previous day is sunday we need to sub 7 days)
    if (dateObj.day() === 1 && startDateTime.day() !== dateObj.day()) {
      startDateTime.subtract(7, 'days');
      endDateTime.subtract(7, 'days');
    }

    // this is previous day
    if (startDateTime.isBefore(dateObj, 'day')) {
      if (index === 0) {
        return prev;
      }

      // this is previous day normal scheduling, ignoring
      if (startDateTime.hours() > 5) {
        return prev;
      }

      // update day
      startDateTime.add(1, 'days');
      endDateTime.add(1, 'days');
    }
    // remove next day schedule from day page
    else {
      // if first of today, don't check
      if (prev.length > 0) {
        const firstStartTimeToday = moment.tz(prev[0].date_time_start, moment.ISO_8601, 'Europe/Paris');

        // this is next day scheduling, ignoring
        if (startDateTime.isSameOrBefore(firstStartTimeToday) && startDateTime.hour() < 6) {
          return prev;
        }
      }
    }

    if (startDateTime.hour() > endDateTime.hour()) {
      endDateTime.add(1, 'days');
    }

    const newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString(),
      'title': curr.title.trim(),
      'img': curr.img || null,
      'description': curr.description.trim()
    };

    prev.push(newEntry);
    return prev;
  }, []);

  return Promise.resolve(cleanedData[name]);
};

const fetch = async (dateObj, name, url) => {
  dateObj.locale('fr');
  const day = utils.upperCaseWords(dateObj.format('dddd'));
  logger.log('info', `fetching ${url}`);

  let realUrl = `${process.env.FETCHER_URL || scraperConfig.fetcher_url}/fetch-html?url=${encodeURIComponent(url)}`

  try {
    const response = await axios.get(realUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.FETCHER_TOKEN || scraperConfig.fetcher_token}`
      }
    });
    const $ = cheerio.load(response.data);
    const data = $.extract({
      shows: [
        {
          selector: `#${day} .c-timeline-emission`,
          value: {
            datetime_raw_start: {
              selector: '.c-timeline-emission__header time:nth-child(1)',
              value: 'datetime'
            },
            datetime_raw_end: {
              selector: '.c-timeline-emission__header time:nth-child(2)',
              value: 'datetime'
            },
            title: '.c-timeline-emission__body h3.c-timeline-emission__heading',
            description: '.c-timeline-emission__body p.c-timeline-emission__description',
            img: {
              selector: '.c-timeline-emission__thumbnail source:first-of-type',
              value: 'srcset'
            },
          }
        }
      ]
    });

    if (data && data.shows) {
      scrapedData[name] = data.shows;
    }
  } catch (error) {
    logger.log('error fetch schedule: ' + error);
  }

  return Promise.resolve(true);
};

const fetchAll = (dateObj, name, url) => {
  scrapedData[name] = [];
  cleanedData[name] = [];

  /* radio schedule page has the format 3am -> 3am,
     so we get the previous day as well to get the full day and the filter the list later  */
  const previousDay = moment(dateObj);
  previousDay.subtract(1, 'days');

  return fetch(previousDay, name, url)
    .then(() => {
      return fetch(dateObj, name, url);
    });
};

const getScrap = (dateObj, name, url, config) => {
  scraperConfig = config;
  scrapedData[name] = [];
  return fetchAll(dateObj, name, url, config)
    .then(async () => {
      return await format(dateObj, name);
    });
};

export default {
  supportTomorrow: false,
  getScrap
};
