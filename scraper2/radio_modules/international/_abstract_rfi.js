import axios from 'axios';
import * as cheerio from 'cheerio';
import moment from 'moment-timezone';
import logger from '../../lib/logger.js';
import * as https from 'https';

let scrapedData = [];

const headers = {
  'Accept-Encoding': 'gzip, deflate, br, zstd',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:140.0) Gecko/20100101 Firefox/140.0',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Host': 'www.rfi.fr',
  'Accept-Language': 'fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3',
  'Sec-GPC': 1,
  'Upgrade-Insecure-Requests': 1,
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
};

const getDescription = async (url) => {
  const response = await axios.get('https://www.rfi.fr' + url, {
    headers,
    httpsAgent: new https.Agent({
      rejectUnauthorized: false
    })
  });
  const $ = cheerio.load(response.data);
  const data = $.extract({
    description: '.o-podcast-about__chapo p',
    description2: '.o-podcast-about__description p',
  });

  let description = '';

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

  const response = await axios.get(url, {
    headers,
    httpsAgent: new https.Agent({
      rejectUnauthorized: false
    })
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

  return Promise.resolve(true);
};

const fetchAll = (dateObj, name, url) => {
  return fetch(dateObj, name, url);
};

const getScrap = (dateObj, name, url) => {
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
