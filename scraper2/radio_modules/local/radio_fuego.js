import axios from 'axios';
import * as cheerio from 'cheerio';
import moment from 'moment-timezone';
import logger from '../../lib/logger.js';

let scraperConfig = {};
let scrapedData = [];

const fetchDesc = async (url) => {
  try {
    console.log(`fetching https://radiofuego.fr${url}`);
    const realUrl = `${process.env.FETCHER_URL || scraperConfig.fetcher_url}/fetch-html?url=${encodeURIComponent(`https://radiofuego.fr${url}`)}`
    const response = await axios.get(realUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.FETCHER_TOKEN || scraperConfig.fetcher_token}`
      }
    });
    const html = response.data;
    const $ = cheerio.load(html);
    const data = $.extract({
      description: '.week-board__description',
    });

    return data.description;
  } catch (error) {
    logger.log('error fetching description');
    return null;
  }
};

const format = async dateObj => {
  const cleanedData = scrapedData.reduce(async function (prevP, entry) {
    const prev = await prevP;
    const regexp = new RegExp(/([0-9]{1,2})[:]([0-9]{2})/);
    let match = entry.datetime_start_raw.trim().match(regexp);

    if (!match) {
      return prev;
    }

    const startDateTime = moment(dateObj);
    const endDateTime = moment(dateObj);

    startDateTime.hour(match[1]);
    startDateTime.minute(match[2]);
    startDateTime.second(0);

    match = entry.datetime_end_raw.trim().match(regexp);

    if (!match) {
      return prev;
    }

    endDateTime.hour(match[1]);
    endDateTime.minute(match[2]);
    endDateTime.second(0);

    const newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString(),
      'title': entry.title.trim(),
      'host': entry.host ? entry.host.trim() : null,
      // 'img': entry.img || null,
    };

    if (entry.host) {
      newEntry.host = entry.host.replace(/^\nAvec /i, '').trim()
    }

    if (entry.link) {
      const description = await fetchDesc(entry.link);
      if (description) {
        newEntry.description = description.trim();
      }
    }

    prev.push(newEntry);
    return prev;
  }, []);

  return await Promise.resolve(cleanedData);
};

const fetch = async dateObj => {
  const url = 'https://radiofuego.fr/programmes';
  let realUrl = `${process.env.FETCHER_URL || scraperConfig.fetcher_url}/fetch-html?url=${encodeURIComponent(url)}`

  logger.log('info', `fetching ${url}`);

  const response = await axios.get(realUrl, {
    headers: {
      'Authorization': `Bearer ${process.env.FETCHER_TOKEN || scraperConfig.fetcher_token}`
    }
  });

  const html = response.data;
  const $ = cheerio.load(html);
  const data = $.extract({
    shows: [
      {
        selector: `.programme-columns-view section.programme-column-day.is-today .programme-column-card`,
        value: {
          datetime_start_raw: 'time',
          datetime_end_raw: '.programme-column-end',
          title: '.programme-column-copy strong',
          host: '.programme-column-copy small',
          link: {
            selector: ':scope',
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
  getName: 'radio_fuego',
  // potentially does, but can't find a good selector
  supportTomorrow: false,
  getScrap
};
