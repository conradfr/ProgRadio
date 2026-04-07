import * as cheerio from 'cheerio';
import moment from 'moment-timezone';
import logger from '../../lib/logger.js';
import puppeteer from '@zorilla/puppeteer-extra'
import StealthPlugin from '@zorilla/puppeteer-extra-plugin-stealth'

let scrapedData = [];

puppeteer.use(StealthPlugin())
let browser = null;

const setBrowser = async () => {
  if (!browser) {
    browser = await puppeteer.launch({
      executablePath: '/usr/bin/chromium',
      headless: true,
      args: ['--headless', '--disable-gpu', '--no-sandbox', '--disable-setuid-sandbox'],
      env: {
        ...process.env,
      },
    })
  }

  return Promise.resolve(true);
}

const getDescription = async (url) => {
  let description = '';
  await setBrowser();
  const page = await browser.newPage();
  await page.goto('https://www.rfi.fr' + url, {
    waitUntil: 'networkidle2',
    timeout: 30000,
  });
  const html = await page.content();

  const $ = cheerio.load(html);
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

  browser.close();
  return Promise.resolve(cleanedData);
};

const fetch = async (dateObj, name, url) => {
  dateObj.locale('fr');

  logger.log('info', `fetching ${url}`);

  try {
    await setBrowser();
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });
    const html = await page.content();

    const $ = cheerio.load(html);
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
    logger.log('error fetch schedule', error);
    browser.close();
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
