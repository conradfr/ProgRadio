import axios from 'axios';
import * as cheerio from 'cheerio';
import moment from 'moment-timezone';
import logger from '../../lib/logger.js';

let scraperConfig = {};
let scrapedData = [];

const fetchDesc = async (url) => {
  try {
    const realUrl = `${process.env.FETCHER_URL || scraperConfig.fetcher_url}/fetch-html?url=${encodeURIComponent(`https://radiofuego.fr${url}`)}`
    const response = await axios.get(realUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.FETCHER_TOKEN || scraperConfig.fetcher_token}`
      }
    });
    const html = response.data;
    const $ = cheerio.load(html);
    const data = $.extract({
      description: 'h2 + div',
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
    let regexp = new RegExp(/([0-9]{1,2})[:]([0-9]{2})\s-\s([0-9]{1,2})[:]([0-9]{2})/);
    let match = entry.datetime_raw.trim().match(regexp);

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
      'title': entry.title.trim(),
      'img': entry.img || null,
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

  const isoDate = dateObj.format('YYYY-MM-DD');

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
        selector: `div[data-date^="${isoDate}"] article.group`,
        value: {
          datetime_raw: 'div.text-2xl.font-bold.mb-1',
          title: 'h3',
          host: 'div.text-lg.text-text',
          img: {
            selector: 'img',
            value: 'src'
          },
          link: {
            selector: 'a',
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
  supportTomorrow: true,
  getScrap
};
