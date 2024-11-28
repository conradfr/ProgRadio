const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');

let scrapedData = [];

const format = dateObj => {
  dateObj.tz('Europe/Paris');
  dateObj.locale('fr');

  const cleanedData = scrapedData.reduce(function (prev, entry) {
    // Time
    let regexp = new RegExp(/([0-9]{1,2}):([0-9]{1,2})/);
    let match = entry.datetime_raw.match(regexp);

    // no time, exit
    if (match === null) {
      return prev;
    }

    let startDateTime = moment(dateObj);
    startDateTime.hour(match[1]);
    startDateTime.minute(match[2]);
    startDateTime.second(0);

    const newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'title': entry.title,
      'description': entry.description || null,
      'host': entry.host || null,
      'img': entry.img || null,
    };

    prev.push(newEntry);
    return prev;
  }, []);

  return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
  dateObj.tz('Europe/Paris');
  dateObj.locale('fr');
  const day = dateObj.format('YYYY-MM-DD');
  const url = `https://www.africaradio.com/grille-programmes/${day}/`;

  logger.log('info', `fetching ${url}`);

  return new Promise(function (resolve, reject) {
    return osmosis
        .get(url)
        .find('.grille .list_obj')
        // .select('.item')
        .set({
          'img': '.list_obj_content img@src',
          'title': '.list_obj_content .titre > h3',
          'datetime_raw': '@data-time',
          'description': '.description',
          'host': '.anim > span'
        })
        .data(function (listing) {
          console.log(listing);
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
  getName: 'africaradio',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
