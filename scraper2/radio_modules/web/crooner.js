import axios from 'axios';
import * as cheerio from 'cheerio';
import moment from 'moment-timezone';
import logger from '../../lib/logger.js';

let scrapedData = [];

const format = async dateObj => {
  dateObj.tz('Europe/Paris');

  const cleanedData = scrapedData.reduce(function (prev, entry) {
    if (!entry.datetime_raw || !entry.title || entry.title === 'Programmes') {
      return prev;
    }

    let regexp = new RegExp(/([0-9]{1,2})[h]\s([0-9]{1,2})[h]/);
    let match = entry.datetime_raw.match(regexp);

    if (!match) {
      return prev;
    }

    const startDateTime = moment(dateObj);
    const endDateTime = moment(dateObj);

    // midnight etc
    if (startDateTime.hour() > endDateTime.hour() || (endDateTime.hour() === 0 && endDateTime.minute() === 0)) {
      endDateTime.add(1, 'days');
    }

    startDateTime.hour(match[1]);
    startDateTime.minute(0);
    startDateTime.second(0);
    endDateTime.hour(match[2]);
    endDateTime.minute(0);
    endDateTime.second(0);

    const newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString(),
      'title': entry.title.trim(),
      'img': entry.img || null,
      description: entry.description || null
    };

    prev.push(newEntry);
    return prev;
  }, []);

  return Promise.resolve(cleanedData);
};

const fetch = async dateObj => {
  dateObj.locale('fr');
  let url = null;
  const dayNum = dateObj.isoWeekday()

  if (dayNum < 6) {
    url = 'https://www.croonerradio.fr/radio/grille-des-programmes/';
  } else if (dayNum === 6) {
    url = 'https://www.croonerradio.fr/radio/grille-des-programmes/week-end-samedi/';
  } else {
    url = 'https://www.croonerradio.fr/radio/grille-des-programmes/dimanche/';
  }

  logger.log('info', `fetching ${url} (day: ${dayNum})`);

  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  const data = $.extract({
    shows: [
      {
        selector: `.fusion-fullwidth > .fusion-row`,
        value: {
          datetime_raw: '.fusion-title-heading span:first-child, h1 > span > span',
          title: {
            selector: '.fusion-title-heading, h1 > span',
            value: el => $(el).contents()
              .filter((_, node) => node.type === 'text')
              .text()
              .trim()
          },
          img: {
            selector: '.fusion-no-lightbox img',
            value: 'src'
          },
          description: 'p > span',
        }
      }
    ]
  });

  if (data && data.shows) {
    scrapedData = data.shows;
  }

  return Promise.resolve(true);
};

const fetchAll = dateObj => {
  return fetch(dateObj);
};

const getScrap = dateObj => {
  return fetchAll(dateObj)
    .then(() => {
      return format(dateObj);
    });
};
export default {
  getName: 'crooner',
  supportTomorrow: true,
  getScrap
};
