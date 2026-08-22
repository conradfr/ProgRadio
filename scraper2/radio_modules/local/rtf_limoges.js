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
  dateObj.tz('Europe/Paris');

  const cleanedData = await scrapedData.reduce(async function (prevP, entry) {
    const prev = await prevP;
    if (!entry.datetime_raw) {
      return prev;
    }

    const startDateTime = moment(dateObj);
    const endDateTime = moment(dateObj);

    const regexp = new RegExp(/([0-9]{2}):([0-9]{2})\s-\s([0-9]{2}):([0-9]{2})/);
    const match = entry.datetime_raw.match(regexp);

    if (!match) {
      return prev;
    }

    startDateTime.hour(match[1]);
    startDateTime.minute(match[2]);
    startDateTime.second(0);
    endDateTime.hour(match[3]);
    endDateTime.minute(match[4]);
    endDateTime.second(0);

    // midnight etc
    if (startDateTime.hour() > endDateTime.hour() || (endDateTime.hour() === 0 && endDateTime.minute() === 0)) {
      endDateTime.add(1, 'days');
    }

    // ENTRY

    const newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString(),
      'title': entry.title.trim(),
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
          selector: `#${day} > div.py-3`,
          value: {
            datetime_raw: 'span.h5',
            title: '.h4.text-primary',
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
