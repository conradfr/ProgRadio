import axios from 'axios';
import * as cheerio from 'cheerio';
import moment from 'moment-timezone';
import logger from '../../lib/logger.js';

let scrapedData = [];

const format = async dateObj => {
  dateObj.tz('Europe/Paris');

  const cleanedData = scrapedData.reduce(function (prev, entry) {
    let regexp = new RegExp(/([0-9]{1,2})[:]([0-9]{1,2})/);

    // START

    let match = entry.datetime_start_raw.match(regexp);

    if (!match) {
      return prev;
    }

    const startDateTime = moment(dateObj);
    let endDateTime = null;

    startDateTime.hour(match[1]);
    startDateTime.minute(match[2]);
    startDateTime.second(0);

    // END

    if (entry.datetime_end_raw) {
      match = entry.datetime_end_raw.match(regexp);

      if (match) {
        endDateTime = moment(dateObj);

        endDateTime.hour(match[1]);
        endDateTime.minute(match[2]);
        endDateTime.second(0);

        // midnight etc
        if (startDateTime.hour() > endDateTime.hour() || (endDateTime.hour() === 0 && endDateTime.minute() === 0)) {
          endDateTime.add(1, 'days');
        }
      }
    }

    let img = null;
    if (entry.img_alt) {
      img = entry.img_alt;
    } else if (entry.img && entry.img.startsWith('http')) {
      img = entry.img;
    }

    if (img) {
      img = img.replace('-96x96', '');
    }


    const newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime ? endDateTime.toISOString() : null,
      'title': entry.title.trim(),
      'host': entry.host ? entry.host.trim() : null,
      'img': img,
    };

    prev.push(newEntry);
    return prev;
  }, []);

  return Promise.resolve(cleanedData);
};

const fetch = async dateObj => {
  dateObj.locale('fr');
  const url = 'https://m40radio.fr/grille-des-programmes/'
  const dayNum = dateObj.isoWeekday() - 1;

  logger.log('info', `fetching ${url}`);

  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  const data = $.extract({
    shows: [
      {
        selector: `div.pmr-sched-day[data-day="${dayNum}"] .pmr-sched-slot`,
        value: {
          datetime_start_raw: '.pmr-sched-times span:first',
          datetime_end_raw: '.pmr-sched-times span:last',
          host: '.pmr-sched-hosts',
          title: '.pmr-sched-name',
          img: {
            selector: '.pmr-sched-info img.pmr-sched-cover',
            value: 'src'
          },
          img_alt: {
            selector: '.pmr-sched-info img.pmr-sched-cover',
            value: 'data-lazy-src'
          },
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
  getName: 'm40',
  supportTomorrow: true,
  getScrap
};
