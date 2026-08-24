import axios from 'axios';
import * as cheerio from 'cheerio';
import moment from 'moment-timezone';
import logger from '../../lib/logger.js';

let scraperConfig = {};
let scrapedData = [];

const getHost = async (url) => {
  try {
    logger.log('info', `fetching host ${url}`);
    let host = null;

    const response = await axios.get(url);

    const $ = cheerio.load(response.data);
    const data = $.extract({
      host: '.qt-item-member .qt-ellipsis.qt-title > .qt-text-shadow',
    });

    if(data.host) {
      host = data.host;
    }

    return Promise.resolve(host);
  } catch (error) {
    logger.log('error fetching description');
    return Promise.resolve(null);
  }
};

const format = async dateObj => {
  const cleanedData = scrapedData.reduce(async function (prevP, entry) {
    const prev = await prevP;
    let regexp = new RegExp(/([0-9]{1,2})[:]([0-9]{2})/);
    let match = entry.datetime_raw.trim().match(regexp);

    if (!match) {
      return prev;
    }

    const startDateTime = moment(dateObj);

    startDateTime.hour(match[1]);
    startDateTime.minute(match[2]);
    startDateTime.second(0);

    const newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'title': entry.title.trim(),
      'description': entry.description ? entry.description.replace(/\n/g, ' ').replace(/\s\s/g, ' ').trim() : null,
      'img': entry.img || null,
    };

    if (entry.link) {
      const host = await getHost(entry.link);
      if (host) {
        newEntry.host = host.trim();
      }
    }

    prev.push(newEntry);
    return prev;
  }, []);

  return await Promise.resolve(cleanedData);
};

const fetch = async dateObj => {
  const url = 'https://www.montagnefm.com/emissions/';

  logger.log('info', `fetching ${url}`);

  const day = dateObj.isoWeekday();

  let id = 'lundi-vendredi';
  if (day === 6) {
    id = 'samedi';
  } else if (day === 7) {
    id = 'dimanche';
  }
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  const data = $.extract({
    shows: [
      {
        selector: `#${id} .qt-show-schedule-day > .col`,
        value: {
          datetime_raw: '.qt-time',
          title: '.qt-title a',
          description: '.qt-more p',
          img: {
            selector: '.qt-header-bg',
            value: 'data-bgimage'
          },
          link: {
            selector: '.qt-more a',
            value: 'href'
          }
        }
      }
    ]
  });

  scrapedData = data.shows;

  return Promise.resolve(true);
};

const fetchAll = dateObj => {
  return fetch(dateObj);
};

const getScrap = (dateObj, _sub_radio, config) => {
  scraperConfig = config;
  dateObj.tz('Europe/Brussels');
  return fetchAll(dateObj)
    .then(() => {
      return format(dateObj);
    });
};
export default {
  getName: 'montagnefm',
  supportTomorrow: true,
  getScrap
};
