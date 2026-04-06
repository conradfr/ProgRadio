import * as cheerio from 'cheerio';
import moment from 'moment-timezone';
import logger from '../../lib/logger.js';
import puppeteer from '@zorilla/puppeteer-extra'
import StealthPlugin from '@zorilla/puppeteer-extra-plugin-stealth'

let html = null;

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
}

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

  const cleanedData = await scrapedData.reduce(async function (prevP, entry) {
    const prev = await prevP;
    if (!entry.time) {
      return prev;
    }

    const startDateTime = moment(entry.dateObj);
    const endDateTime = moment(entry.dateObj);

    const regexp = new RegExp(/([0-9]{2})h([0-9]{2}) - ([0-9]{2})h([0-9]{2})/);
    const match = entry['time'].match(regexp);

    if (!match) {
      return prev;
    }

    startDateTime.hour(match[1]);
    startDateTime.minute(match[2]);
    startDateTime.second(0);
    endDateTime.hour(match[3]);
    endDateTime.minute(match[4]);
    endDateTime.second(0);

    // this is previous day
    if (startDateTime.isBefore(dateObj, 'day')) {
      // this is previous day normal scheduling, ignoring
      if (startDateTime.hours() > 5) {
        return prev;
      }

      // update day
      startDateTime.add(1, 'days');
      endDateTime.add(1, 'days');
    }
    // remove next day schedule from day page
    else {
      // this is next day scheduling, ignoring
      if (startDateTime.hour() < 5) {
        return prev;
      }
    }

    // ENTRY

    const newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString(),
      'title': entry.title,
      'img': entry.img,
    };

    if (entry.host) {
      const host = entry.host.replace(/\s+/g, ' ').trim();
      if (host && host !== '') {
        newEntry.host = host;
      }
    }

    // fetch description if link
    // do it here instead of scrapping function to avoid scraping future discarded entries
    if (entry.page) {
      try {
        await setBrowser();
        const page = await browser.newPage();
        await page.goto(`https://www.europe1.fr${entry.page}`, {
          waitUntil: 'networkidle2',
          timeout: 30000,
        });
        const pageHtml = await page.content();

        if (pageHtml) {
          const $ = cheerio.load(pageHtml);
          const dataPage = $.extract({
            show: [
              {
                selector: `.emission-description .emission-description__content > div`,
                value: {
                  description: 'div:not(.visually-hidden)',
                }
              }
            ]
          });

          if (dataPage) {
            newEntry.description = dataPage.show?.[0]?.description;
          }
        }

        await page.close();
      } catch (error) {
        logger.log('error fetch description', error);
      }
    }

    prev.push(newEntry);
    return prev;
  }, []);

  if (browser) {
    await browser.close();
  }
  return Promise.resolve(cleanedData);
};

const fetch = async dateObj => {
  try {
    const url = 'https://www.europe1.fr/grille-des-programmes';

    dateObj.locale('fr');
    const day = dayFr[dateObj.isoWeekday()];

    logger.log('info', `fetching ${url}`);

    if (!html) {
      await setBrowser();
      const page = await browser.newPage();
      await page.goto(url, {
       waitUntil: 'networkidle2',
       timeout: 30000,
      });
      html = await page.content();
    }

    let $ = cheerio.load(html);
    const data = $.extract({
      shows: [
        {
          selector: `#panel-${day} .programme-semaine`,
          value: {
            time: '.horaires-item-programme',
            title: '.title-item-programme',
            img: {
              selector: '.cover-item-programme > img',
              value: 'src'
            },
            host: '.author-item-programme',
            page: {
              selector: '.wrapper-item-programme > .item-programme > a',
              value: 'href'
            }
          }
        }
      ]
    });

    if (data && data.shows) {
      for (const item of data.shows) {
        item.dateObj = dateObj;
      }

      scrapedData = scrapedData.concat(data.shows);
    }
  } catch (error) {
    logger.log('error fetch schedule', error);
    browser.close();
  }

  return Promise.resolve(true);
};

const fetchAll = dateObj => {
  dateObj.tz('Europe/Paris');
  const previousDay = moment(dateObj);
  previousDay.subtract(1, 'days');

  return fetch(previousDay)
    .then(() => {
      return fetch(dateObj);
    }).catch(() => fetch(dateObj));
};

const getScrap = dateObj => {
  return fetchAll(dateObj)
    .then(() => {
      return format(dateObj);
    });
};
export default {
  getName: 'europe1',
  supportTomorrow: true,
  getScrap
};
