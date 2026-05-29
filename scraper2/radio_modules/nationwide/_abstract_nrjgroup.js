import * as cheerio from 'cheerio';
import moment from 'moment-timezone';
import utils from '../../lib/utils.js';
import logger from '../../lib/logger.js';
import puppeteer from '@zorilla/puppeteer-extra'
import StealthPlugin from '@zorilla/puppeteer-extra-plugin-stealth'

const scrapedData = {};
const cleanedData = {};

puppeteer.use(StealthPlugin())
let browser = null;

const setBrowser = async () => {
  if (browser && browser.isConnected()) {
    return;
  }
  // kill any stale reference
  if (browser) {
    try { await browser.close(); } catch (_) {}
    browser = null;
  }
  browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--single-process',
    ],
    timeout: 240000,
    env: {
      ...process.env,
    },
  });

  return Promise.resolve(true);
};

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
      // 'img': `${process.env.PROXY_URL}nostalgie.jpg?key=${process.env.PROXY_KEY}&url=${img}`,
      'img': curr.img || null,
      'description': curr.description.trim()
    };

    prev.push(newEntry);
    return prev;
  }, []);

  browser.close();

  return Promise.resolve(cleanedData[name]);
};

const fetch = async (dateObj, name, url) => {
  dateObj.locale('fr');
  const day = utils.upperCaseWords(dateObj.format('dddd'));
  logger.log('info', `fetching ${url}`);

  try {
    await setBrowser();
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(120000);
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 120000,
    });
    const html = await page.content();

    const $ = cheerio.load(html);
    const data = $.extract({
      shows: [
        {
          selector: `#${day} .timelineShedule`,
          value: {
            datetime_raw_start: {
              selector: '.timelineShedule-header time.timelineShedule-time:nth-child(1)',
              value: 'datetime'
            },
            datetime_raw_end: {
              selector: '.timelineShedule-header time.timelineShedule-time:nth-child(2)',
              value: 'datetime'
            },
            title: '.timelineShedule-content h3.a-heading-3',
            description: '.timelineShedule-content p.description',
            img: {
              selector: '.timelineShedule__thumbnail source:first-of-type',
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
    browser.close();
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

const getScrap = (dateObj, name, url) => {
  scrapedData[name] = [];
  return fetchAll(dateObj, name, url)
    .then(async () => {
      return await format(dateObj, name);
    });
};

export default {
  supportTomorrow: false,
  getScrap
};
