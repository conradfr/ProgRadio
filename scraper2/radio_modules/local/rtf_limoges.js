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

const format = async dateObj => {
  const cleanedData = scrapedData.reduce(function (prev, entry) {
    if (!entry.datetime_start || !entry.datetime_end || !entry.title) {
      return prev;
    }

    const startDateTime = moment(entry.datetime_start, moment.ISO_8601);
    const endDateTime = moment(entry.datetime_end, moment.ISO_8601);

    if (!startDateTime.isValid() || !endDateTime.isValid()) {
      return prev;
    }

    // ENTRY

    const newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString(),
      'title': entry.title.trim(),
      'img': entry.img ?  entry.img.trim() : null
    };

    prev.push(newEntry);
    return prev;
  }, []);

  return Promise.resolve(cleanedData);
};

const fetch = async dateObj => {
  try {
    const url = 'https://www.rtflimoges.com/grille/';

    dateObj.locale('fr');
    const day = dayFr[dateObj.isoWeekday()];

    logger.log('info', `fetching ${url}`);

    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const data = $.extract({
      shows: [
        {
          selector: `#${day} > ul > li`,
          value: {
            datetime_start: {
              selector: '.creneau__heure time:first-of-type',
              value: 'datetime'
            },
            datetime_end: {
              selector: '.creneau__heure time:last-of-type',
              value: 'datetime'
            },
            title: {
              selector: '.creneau__nom-texte',
              value: el => $(el).contents().first().text()
            },
            img: {
              selector: '.vignette-programme > img',
              value: 'src'
            },
          }
        }
      ]
    });

    if (data && data.shows) {
      scrapedData = data.shows;
    }
  } catch (error) {
    logger.log('error fetch schedule');
  }

  return Promise.resolve(true);
};

const fetchAll = dateObj => {
  return fetch(dateObj);
};

const getScrap = (dateObj, name, config) => {
  scraperConfig = config;
  return fetchAll(dateObj)
    .then(() => {
      return format(dateObj);
    });
};
export default {
  getName: 'rtf_limoges',
  supportTomorrow: true,
  getScrap
};
