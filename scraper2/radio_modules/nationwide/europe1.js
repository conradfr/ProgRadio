import axios from 'axios';
import * as cheerio from 'cheerio';
import moment from 'moment-timezone';
import logger from '../../lib/logger.js';

const dayFr = {
  1: 'lundi',
  2: 'mardi',
  3: 'mercredi',
  4: 'jeudi',
  5: 'vendredi',
  6: 'samedi',
  7: 'dimanche'
};

let scraperConfig = {};
let scrapedData = [];
let html = null;

const getDescription = async (url) => {
  let description = null;

  logger.log('debug', `fetching ${url}`);

  try {
    let realUrl = `${process.env.FETCHER_URL || scraperConfig.fetcher_url}/fetch-html?url=${encodeURIComponent(`https://www.europe1.fr${url}`)}`

    const response = await axios.get(realUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.FETCHER_TOKEN || scraperConfig.fetcher_token}`
      }
    });

    const $ = cheerio.load(response.data);
    const dataPage = $.extract({
      show: [
        {
          selector: `.emission-description .emission-description__content > div`,
          value: {
            description: 'div:not(.visually-hidden)',
          }
        }
      ]
    });

    if (dataPage) {
      description = dataPage.show?.[0]?.description;
    }

  } catch (error) {
    logger.log('error fetch description');
  }

  return Promise.resolve(description);
};

const format = async dateObj => {
  dateObj.tz('Europe/Paris');

  const cleanedData = await scrapedData.reduce(async function (prevP, entry) {
    const prev = await prevP;
    if (!entry.time) {
      return prev;
    }

    const startDateTime = moment(entry.dateObj);
    const endDateTime = moment(entry.dateObj);

    const regexp = new RegExp(/([0-9]{2})h([0-9]{2}) - ([0-9]{2})h([0-9]{2})/);
    const match = entry['time'].match(regexp);

    if (!match) {
      return prev;
    }

    startDateTime.hour(match[1]);
    startDateTime.minute(match[2]);
    startDateTime.second(0);
    endDateTime.hour(match[3]);
    endDateTime.minute(match[4]);
    endDateTime.second(0);

    // this is previous day
    if (startDateTime.isBefore(dateObj, 'day')) {
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
      // this is next day scheduling, ignoring
      if (startDateTime.hour() < 5) {
        return prev;
      }
    }

    // ENTRY

    const newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString(),
      'title': entry.title,
      'img': entry.img,
    };

    if (entry.host) {
      const host = entry.host.replace(/\s+/g, ' ').trim();
      if (host && host !== '') {
        newEntry.host = host;
      }
    }

    // fetch description if link
    // do it here instead of scrapping function to avoid scraping future discarded entries
    if (entry.page) {
      const description = await getDescription(entry.page);
      newEntry.description = description;
    }

    prev.push(newEntry);
    return prev;
  }, []);

  return Promise.resolve(cleanedData);
};

const fetch = async dateObj => {
  try {
    const url = 'https://www.europe1.fr/grille-des-programmes';

    dateObj.locale('fr');
    const day = dayFr[dateObj.isoWeekday()];

    logger.log('info', `fetching ${url}`);

    if (!html) {
      let realUrl = `${process.env.FETCHER_URL || scraperConfig.fetcher_url}/fetch-html?url=${encodeURIComponent(url)}`

      const response = await axios.get(realUrl, {
        headers: {
          'Authorization': `Bearer ${process.env.FETCHER_TOKEN || scraperConfig.fetcher_token}`
        }
      });
      html = response.data;
    }

    let $ = cheerio.load(html);
    const data = $.extract({
      shows: [
        {
          selector: `#panel-${day} .programme-semaine`,
          value: {
            time: '.horaires-item-programme',
            title: '.title-item-programme',
            img: {
              selector: '.cover-item-programme > img',
              value: 'src'
            },
            host: '.author-item-programme',
            page: {
              selector: '.wrapper-item-programme > .item-programme > a',
              value: 'href'
            }
          }
        }
      ]
    });

    if (data && data.shows) {
      for (const item of data.shows) {
        item.dateObj = dateObj;
      }

      scrapedData = scrapedData.concat(data.shows);
    }
  } catch (error) {
    logger.log('error fetch schedule');
  }

  return Promise.resolve(true);
};

const fetchAll = dateObj => {
  dateObj.tz('Europe/Paris');
  const previousDay = moment(dateObj);
  previousDay.subtract(1, 'days');

  return fetch(previousDay)
    .then(() => {
      return fetch(dateObj);
    }).catch(() => fetch(dateObj));
};

const getScrap = (dateObj, name, config) => {
  scraperConfig = config;
  return fetchAll(dateObj)
    .then(() => {
      return format(dateObj);
    });
};
export default {
  getName: 'europe1',
  supportTomorrow: true,
  getScrap
};
