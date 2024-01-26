const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');
const utils = require("../../lib/utils");

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

const format = dateObj => {
  dateObj.tz('Europe/Zurich');
  dateObj.locale('fr');

  const cleanedData = scrapedData.reduce(function (prev, entry) {
    const description_join = entry.description_alt ?  entry.description_alt.join(' ').trim() : entry.description;
    const dayNum = dateObj.isoWeekday();
    let matched = false;

    let regexp = new RegExp(/u\s(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\sau\s(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)/);
    let match = description_join.match(regexp);

    if (match !== null) {
      if (dayNum < dayFr[match[1]] || dayNum > dayFr[match[2]]) {
        return prev;
      }

      matched = true;
    }

    if (matched === false) {
      regexp = new RegExp(/ous les (lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)/);
      match = description_join.match(regexp);

      if (match !== null && dayNum === dayFr[match[1]]) {
        matched = true;
      }
    }

    if (matched === false) {
      return prev;
    }

    regexp = new RegExp(/(?:de|entre) ([0-9]{1,2})[h|H]([0-9]{0,2})/);
    let match_time = description_join.match(regexp);

    if (!match_time) {
      return prev;
    }

    regexp = new RegExp(/(?:à|et) ([0-9]{1,2})[h|H]([0-9]{0,2})/);
    let match_time_end = description_join.match(regexp);

    let startDateTime = moment(dateObj);
    startDateTime.hour(match_time[1]);

    if (match_time[2]) {
      startDateTime.minute(match_time[2]);
    }  else {
      startDateTime.minute(0);
    }

    startDateTime.second(0);

    const newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'title': entry.title,
      'description': description_join || null,
      'img': entry.img ? `https://radiochablais.ch${entry.img}` : null
    }

    if (match_time_end) {
      let endDateTime = moment(dateObj);

      endDateTime.hour(match_time_end[1]);

      if (match_time_end[2]) {
        endDateTime.minute(match_time_end[2]);
      }  else {
        endDateTime.minute(0);
      }

      endDateTime.second(0);

      newEntry.date_time_end = endDateTime.toISOString();
    }

    prev.push(newEntry);
    return prev;
  }, []);

  return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
  const url = 'https://radiochablais.ch/radio/emissions';

  dateObj.tz('Europe/Zurich');
  dateObj.locale('fr');

  logger.log('info', `fetching ${url}`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .select('.com-content-category-blog__item.blog-item')
      .set({
        'img': '.lazyload@data-src',
        'title': '.article-header h2 a',
        'description': '.item-content p'
      })
      .do(
        osmosis.follow('figure a@href')
          .set({
            'description_alt': ['div[itemprop="articleBody"] p']
          })
      )
      .data(function (listing) {
        scrapedData.push(listing);
      })
      .done(function () {
        resolve(true);
      })
  });
};

const fetchAll = dateObj => {
  return fetch(dateObj);
};

const getScrap = dateObj => {
  return fetchAll(dateObj)
    .then(() => {
      return format(dateObj);
    });
};

const scrapModule = {
  getName: 'radiochablais',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
