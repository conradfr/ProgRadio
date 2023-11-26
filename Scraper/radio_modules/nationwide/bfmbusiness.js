const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');

let scrapedData = [];

const format = dateObj => {
  dateObj.tz('Europe/Paris');
  dateObj.locale('fr');

  const cleanedData = scrapedData.reduce(function (prev, entry) {
    regexp = new RegExp(/([0-9]{1,2}):([0-9]{1,2})/);
    match = entry.datetime_raw.match(regexp);

    let startDateTime = null;

    // note: midnight will be the wrong day but it's currently the same everyday so it's kinda ok
    if (match !== null) {
      startDateTime = moment(dateObj);
      startDateTime.hour(match[1]);
      startDateTime.minute(match[2]);
      startDateTime.second(0);
    } else {
      return prev;
    }
    entry.date_time_start = startDateTime.toISOString();
    delete(entry.datetime_raw);

    if ((entry.img === undefined || entry.img === null)
      && (entry.img_alt !== undefined && entry.img_alt !== null)) {
      let img = entry.img_alt;
      if (img.startsWith('http') === false) {
        img = `https://www.bfmtv.com${img}`;
      }
      entry.img = img;
    }

    delete(entry.img_alt);

    prev.push(entry);
    return prev;
  }, []);

  return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
  const url = 'https://www.bfmtv.com/economie/programme-tv-radio/';

  const today = moment().tz('Europe/Paris');
  const dayDiff = Math.ceil(dateObj.diff(today, 'days', true)) + 1;

  logger.log('info', `fetching ${url} (diff ${dayDiff})`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .find(`div.grille_programmes:nth-of-type(${dayDiff})`)
      .select('article.grille_hours_content')
      .set({
        'img': '.grille_picture > noscript > img@src',
        'img_alt': '.grille_picture > img@src',
        'title': '.grille_title',
        'datetime_raw': '.grille_date'
      })
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
  getName: 'bfmbusiness',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
