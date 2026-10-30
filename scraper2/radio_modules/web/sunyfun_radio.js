import * as cheerio from 'cheerio';
import moment from 'moment-timezone';
import logger from '../../lib/logger.js';
import cache from '../../lib/cache.js';

const dayFr = {
  1: 'lundi',
  2: 'mardi',
  3: 'mercredi',
  4: 'jeudi',
  5: 'vendredi',
  6: 'samedi',
  7: 'dimanche'
};

let scrapedData = {};

const format = async (dateObj, subRadio) => {
  dateObj.tz('Europe/Paris');

  const cleanedData = scrapedData[subRadio].reduce(function (prev, entry) {
    let regexp = new RegExp(/([0-9]{1,2}):([0-9]{1,2}) - ([0-9]{1,2}):([0-9]{1,2})/);

    // START

    // "00:00 - 01:00"
    const match = (entry.datetime_raw || '').match(regexp);

    if (!match) {
      return prev;
    }

    const startDateTime = moment(dateObj);

    startDateTime.hour(match[1]);
    startDateTime.minute(match[2]);
    startDateTime.second(0);

    // END

    const endDateTime = moment(dateObj);

    endDateTime.hour(match[3]);
    endDateTime.minute(match[4]);
    endDateTime.second(0);

    // midnight etc
    if (startDateTime.isSameOrAfter(endDateTime)) {
      endDateTime.add(1, 'days');
    }

    const newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString(),
      'title': entry.title.trim(),
      'img': entry.img ? entry.img.trim() : null,
    };

    prev.push(newEntry);
    return prev;
  }, []);

  return Promise.resolve(cleanedData);
};

const fetch = async (dateObj, subRadio) => {
  dateObj.locale('fr');
  const url = 'https://www.sunyfunradio.fun/shows-schedule/';

  logger.log('info', `fetching ${url}`);

  const html = await cache.fetchUrl(url);
  const $ = cheerio.load(html);

  // all the days are on the page, each one in a tab starting with its name
  const day = $('.proradio-tabs__content').filter(function () {
    return $(this).find('.proradio-schedule__dayname').text().trim().toLowerCase() === dayFr[dateObj.isoWeekday()];
  });

  const data = day.extract({
    shows: [
      {
        selector: `.proradio-col`,
        value: {
          datetime_raw: '.proradio-itemmetas',
          title: 'h3 a',
          img: {
            selector: 'img.proradio-post__thumb',
            value: 'src'
          },
        }
      }
    ]
  });

  if (data && data.shows) {
    scrapedData[subRadio] = data.shows;
  }

  return Promise.resolve(true);
};

const fetchAll = (dateObj, subRadio) => {
  return fetch(dateObj, subRadio);
};

const getScrap = (dateObj, subRadio) => {
  return fetchAll(dateObj, subRadio)
    .then(() => {
      return format(dateObj, subRadio);
    });
};
export default {
  getName: 'sunyfun_radio',
  supportTomorrow: true,
  getScrap
};
