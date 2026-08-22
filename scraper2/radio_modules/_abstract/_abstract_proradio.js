import axios from 'axios';
import * as cheerio from 'cheerio';
import moment from 'moment-timezone';
import logger from '../../lib/logger.js';

const dayFrInv = {
  1: 'Lundi',
  2: 'Mardi',
  3: 'Mercredi',
  4: 'Jeudi',
  5: 'Vendredi',
  6: 'Samedi',
  7: 'Dimanche'
};

let scrapedData = {};

const format = async (dateObj, name, subRadio) => {
  dateObj.tz('Europe/Paris');
  dateObj.locale('fr');

  const cleanedData = scrapedData[name][subRadio].reduce(async function (prevP, entry) {
    const prev = await prevP;
    if (!entry.datetime_raw) {
      return prev;
    }

    const regexp = new RegExp(/([0-9]{1,2})[:]([0-9]{2})\s-\s([0-9]{1,2})[:]([0-9]{2})/);
    const match = entry.datetime_raw.match(regexp);

    if (!match) {
      return prev;
    }

    const startDateTime = moment(dateObj);
    startDateTime.hour(match[1]);
    startDateTime.minute(match[2]);
    startDateTime.second(0);

    const endDateTime = moment(dateObj);
    endDateTime.hour(match[3]);
    endDateTime.minute(match[4]);
    endDateTime.second(0);

    // end at midnight etc
    if (match[3] < match[1]) {
      endDateTime.add(1, 'days');
    }

    const newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString(),
      'img': entry.img ? entry.img.trim() : null,
      'title': entry.title.trim(),
      'description': entry.description ? entry.description.trim() : null,
    };

    prev.push(newEntry);
    return prev;
  }, []);

  return await Promise.resolve(cleanedData);
};

const fetch = async (dateObj, name, subRadio, url) => {
  dateObj.locale('fr');
  const day = dayFrInv[dateObj.isoWeekday()];

  logger.log('info', `fetching ${url}`);

  const response = await axios.get(url);
  const html = response.data;
  const $ = cheerio.load(html);
  const data = $.extract({
    shows: [
      {
        selector: `div:has(> h3.proradio-schedule__dayname:contains("${day}")) .proradio-col`,
        value: {
          datetime_raw: '.proradio-itemmetas',
          title: '.proradio-post__title > a',
          img: {
            selector: '.proradio-bgimg > img',
            value: 'src'
          },
          description: '.proradio-post__headercont--ex p',
          link: {
            selector: '.proradio-post__title > a',
            value: 'href'
          },
        }
      }
    ]
  });

  scrapedData[name][subRadio] = data.shows;

  return Promise.resolve(true);
};

const fetchAll = (dateObj, name, subRadio, url) => {
  return fetch(dateObj, name, subRadio, url);
};

const getScrap = (dateObj, name, subRadio, url, config) => {
  scrapedData[name] = {};
  scrapedData[name][subRadio] = [];

  return fetchAll(dateObj, name, subRadio, url)
    .then(() => {
      return format(dateObj, name, subRadio);
    });
};

export default {
  supportTomorrow: true,
  getScrap
};
