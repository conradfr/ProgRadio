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

let scrapedData = [];

const format = async dateObj => {
  dateObj.tz('Europe/Paris');

  const cleanedData = scrapedData.reduce(function (prev, entry) {
    let regexp = new RegExp(/de ([0-9]{1,2})[:]([0-9]{2})\sà\s([0-9]{1,2})[:]([0-9]{2})/);
    let match = entry.datetime_raw.match(regexp);

    if (!match) {
      return prev;
    }

    const startDateTime = moment(dateObj);
    const endDateTime = moment(dateObj);

    startDateTime.hour(match[1]);
    startDateTime.minute(match[2]);
    startDateTime.second(0);
    endDateTime.hour(match[3]);
    endDateTime.minute(match[4]);
    endDateTime.second(0);

    const newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString(),
      'title': entry.title.replace(/\s\s+/g, '').trim(),
      'img': `https://in2mixxradio.com${entry.img}`,
    };

    if (entry.host) {
      let host = [];
      for (const one of entry.host) {
        host.push(one.replace(/\s\s+/g, '').trim());
      }

      if (host.length > 0) {
        newEntry.host = host.join(', ');
      }
    }

    // remove placeholder (guys ...)
    if (entry.description && entry.description.indexOf('Lorem') === -1 && entry.description.indexOf('Horum') === -1) {
      newEntry.description = entry.description.trim();
    }

    prev.push(newEntry);
    return prev;
  }, []);

  return Promise.resolve(cleanedData);
};

const fetch = async dateObj => {
  const url = 'https://in2mixxradio.com/emissions';
  dateObj.locale('fr');
  const day = dayFr[dateObj.isoWeekday()];

  logger.log('info', `fetching ${url}`);

  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  const data = $.extract({
    shows: [
      {
        selector: `.${day}`,
        value: {
          datetime_raw: 'h6',
          title: 'h2 a',
          img: {
            selector: '.n_post_image img',
            value: 'src'
          },
          description: '.n_post_content p',
          host: ['.anims span'],
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
  getName: 'in2mixxradio',
  supportTomorrow: true,
  getScrap
};