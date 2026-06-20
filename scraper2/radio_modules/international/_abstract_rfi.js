import axios from 'axios';
import * as cheerio from 'cheerio';
import moment from 'moment-timezone';
import logger from '../../lib/logger.js';

let scraperConfig = {};
let scrapedData = [];

const getDescription = async (url) => {
  logger.log('debug', `fetching ${url}`);
  let description = '';

  try {
    let realUrl = `${process.env.FETCHER_URL || scraperConfig.fetcher_url}/fetch-html?url=${encodeURIComponent(`https://www.rfi.fr${url}`)}`

    const response = await axios.get(realUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.FETCHER_TOKEN || scraperConfig.fetcher_token}`
      }
    });

    const $ = cheerio.load(response.data);
    const data = $.extract({
      description: '.o-podcast-about__chapo p',
      description2: '.o-podcast-about__description p',
    });

    if(data.description) {
      description = data.description;
    }

    if(data.description2) {
      if(data.description) {
        description += '\n\n';
      }
      description += data.description2;
    }

    return Promise.resolve(description);
  } catch (error) {
    logger.log('error fetching description');
    return Promise.resolve(null);
  }
};

const format = async (dateObj, name) => {
  const cleanedData = await scrapedData[name].reduce(async function(prevP, entry){
    const prev = await prevP;
    if (!entry.datetime_raw || !entry.title) {
      return prev;
    }

    const parisTime = moment().tz('Europe/Paris');
    const hoursDifference = parisTime.utcOffset() / 60;

    const startDateTime = moment(entry.datetime_raw);
    startDateTime.add(hoursDifference, 'hours');

    const newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'img': entry.img ? entry.img : null,
      'title': entry.title ? entry.title.replace(/\s+/g, ' ').trim() : null,
      'host': entry.host ? entry.host.replace(/\s+/g, ' ').replace('Par : ', '').trim() : null,
    };

    if (entry.link) {
      const description = await getDescription(entry.link);

      if (description && description.trim() !== '') {
        newEntry.description = description.trim();
      }
    }

    prev.push(newEntry);
    return prev;
  }, []);

  return Promise.resolve(cleanedData);
};

const fetch = async (dateObj, name, url) => {
  dateObj.locale('fr');

  logger.log('info', `fetching ${url}`);

  let realUrl = `${process.env.FETCHER_URL || scraperConfig.fetcher_url}/fetch-html?url=${encodeURIComponent(url)}`

  try {
    const response = await axios.get(realUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.FETCHER_TOKEN || scraperConfig.fetcher_token}`
      }
    });

    const $ = cheerio.load(response.data);
    const data = $.extract({
      shows: [
        {
          selector: '.o-layout-list__item',
          value: {
            datetime_raw: {
              selector: 'time.m-item-program-grid__timeline__time',
              value: 'datetime'
            },
            link: {
              selector: '.m-item-program-grid__infos__titles a',
              value: 'href'
            },
            title: 'p.m-item-program-grid__infos__program-title',
            host: 'p.m-item-program-grid__infos__edition-authors',
            img: {
                selector: 'img.a-img',
                value: 'src'
            },
          }
        }
      ]
    });

    if (data && data.shows) {
      scrapedData[name] = data.shows;
    }
  } catch (error) {
    logger.log('error fetch schedule: ' + error);
  }

  return Promise.resolve(true);
};

const fetchAll = (dateObj, name, url) => {
  return fetch(dateObj, name, url);
};

const getScrap = (dateObj, name, url, config) => {
  scraperConfig = config;
  scrapedData[name] = [];
  return fetchAll(dateObj, name, url)
    .then(async () => {
      return await format(dateObj, name);
    });
};

export default {
  supportTomorrow: false,
  getScrap
};
