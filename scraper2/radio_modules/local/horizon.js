import axios from 'axios';
import * as cheerio from 'cheerio';
import moment from 'moment-timezone';
import logger from '../../lib/logger.js';

let scrapedData = [];

const format = async dateObj => {
  dateObj.tz('Europe/Paris');

  const cleanedData = scrapedData.reduce(function (prev, entry) {
    if (!entry.datetime_raw) {
      return prev;
    }

    const regexp = new RegExp(/([0-9]{1,2})[:]([0-9]{2})/);
    let match = entry.datetime_raw.match(regexp);

    if (!match) {
      return prev;
    }
    const startDateTime = moment(dateObj);
      startDateTime.hour(match[1]);
      startDateTime.minute(match[2]);
      startDateTime.second(0);

    const newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'title': entry.title,
    };

    if (entry.description) {
      newEntry.description = entry.description.replace(/\n/g, ' ').replace(/\s\s/g, ' ').trim();
    }

    if (entry.img) {
      newEntry.img = entry.img;
    }

    if (entry.host) {
      newEntry.host = entry.host;
    }

    prev.push(newEntry);
    return prev;
  }, []);

  return Promise.resolve(cleanedData);
};

const fetch = async dateObj => {
  dateObj.tz('Europe/Paris');
  const format = 'YYYY-MM-DD';
  const dateStr = dateObj.format(format)
  const url = `https://www.horizonactu.fr/grille-programmes/${dateStr}/`

  logger.log('info', `fetching ${url}`);

  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  const data = $.extract({
    shows: [
      {
        selector: '.grille section',
        value: {
          datetime_raw: {
            selector: ':scope',
            value: 'data-time'
          },
          title: 'h3',
          img: {
            selector: 'img',
            value: 'src'
          },
          description: 'p.description',
          host: 'p.anim span',
        }
      }
    ]
  });

  if (data && data.shows) {
    scrapedData = scrapedData.concat(data.shows);
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
  getName: 'horizon',
  supportTomorrow: true,
  getScrap
};
