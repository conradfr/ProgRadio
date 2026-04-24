import * as cheerio from 'cheerio';
import moment from 'moment-timezone';
import logger from '../../lib/logger.js';
import puppeteer from '@zorilla/puppeteer-extra'
import StealthPlugin from '@zorilla/puppeteer-extra-plugin-stealth'

const dayFr = {
  'lundi': 1,
  'mardi': 2,
  'mercredi': 3,
  'jeudi': 4,
  'vendredi': 5,
  'samedi': 6,
  'dimanche': 7
};

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
  await page.goto(url, {
    waitUntil: 'networkidle2',
    timeout: 30000,
  });
  const html = await page.content();

  const $ = cheerio.load(html);
  const data = $.extract({
    description: '.main-article p',
  });

  if(data.description) {
    description = data.description;
  }

  return Promise.resolve(description);
};

const format = async (dateObj, name) => {
  const cleanedData = await scrapedData[name].reduce(async function(prevP, entry){
    const prev = await prevP;
    if (!entry.datetime_raw || !entry.title) {
      return prev;
    }

    let matched = false;
    let match_time = null;

    let regexp = new RegExp(/^Du\s(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\sau\s(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)/);
    let match = entry.datetime_raw.trim().match(regexp);

    if (match !== null) {
      if (dateObj.isoWeekday() >= dayFr[match[1]] && dateObj.isoWeekday() <= dayFr[match[2]]) {
        matched = true;
      }
    }

    /*        if (matched === false) {
                regexp = new RegExp(/^Toute la semaine/);
                match = entry.datetime_raw.match(regexp);

                if (match !== null) {
                    matched = true;
                }
            }*/

    if (matched === false) {
      regexp = new RegExp(/^Le week-end/);
      match = entry.datetime_raw.trim().match(regexp);

      if (match !== null && [6, 7].indexOf(dateObj.isoWeekday()) > -1) {
        matched = true;
      } else {
        regexp = new RegExp(/^(Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi|Dimanche)/);
        match = entry.datetime_raw.trim().match(regexp);

        if (match !== null && dateObj.isoWeekday() === dayFr[match[1].toLowerCase()]) {
          matched = true;
        }
      }
    }

    if (matched === true) {
      regexp = new RegExp(/([0-9]{1,2})[h|H]([0-9]{2}) - ([0-9]{1,2})[h|H]([0-9]{2})/);
      match_time = entry.datetime_raw.trim().match(regexp);
    } else {
      return prev;
    }

    const startDateTime = moment(dateObj);
    startDateTime.hour(match_time[1]);
    startDateTime.minute(match_time[2]);
    startDateTime.second(0);

    const endDateTime = moment(dateObj);
    endDateTime.hour(match_time[3]);
    endDateTime.minute(match_time[4]);
    endDateTime.second(0);

    // midnight etc
    if (startDateTime.hour() > endDateTime.hour() || (endDateTime.hour() === 0 && endDateTime.minute() === 0)) {
      endDateTime.add(1, 'days');
    }

    const newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString(),
      'img': entry.img ? entry.img : null,
      'title': entry.title ? entry.title.replace(/\s+/g, ' ').trim() : null,
      'host': entry.host ? entry.host.replace(/^avec /i, '') : null
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
          selector: '.row > .post',
          value: {
            datetime_raw: '.item-content > .item-icons',
            host: '.item-content > p',
            title: '.item-content > h3 > a',
            img: {
                selector: '.item-header > a > img',
                value: 'data-src'
            },
            link: {
              selector: '.item-content > a',
              value: 'href'
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
  supportTomorrow: true,
  getScrap
};
