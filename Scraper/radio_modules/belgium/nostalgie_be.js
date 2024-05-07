const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');

let scrapedData = [];

const format = dateObj => {

  // we use reduce instead of map to act as a map+filter in one pass
  const cleanedData = scrapedData.reduce(function (prev, curr, index, array) {
    let regexp = new RegExp(/^([0-9]{1,2})h(.|\n|\t)*>(.|\n|\t)*([0-9]{1,2})h/);
    let match = curr.datetime_raw.match(regexp);

    // no time = exit
    if (match === null) {
      return prev;
    }

    const startDateTime = moment(curr.dateObj);
    startDateTime.tz(dateObj.tz());
    const endDateTime = moment(curr.dateObj);
    endDateTime.tz(dateObj.tz());

    startDateTime.hour(match[1]);
    startDateTime.minute(0);
    startDateTime.second(0);
    endDateTime.hour(match[4]);
    endDateTime.minute(0);
    endDateTime.second(0);

    if (startDateTime.hour() > endDateTime.hour()) {
      endDateTime.add(1, 'days');
    }

    newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString(),
      'host': curr.host,
      'title': curr.title,
      'img': curr.img
    };

    prev.push(newEntry);
    return prev;
  }, []);

  return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
  const url = 'https://www.nostalgie.be/radio/grille';
  const dayNb = dateObj.isoWeekday() - 1;

  logger.log('info', `fetching ${url}`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .find(`#nav-${dayNb}`)
      .select('.grid-item')
      .set({
        'img': '.grid-item__pict@data-src',
        'datetime_raw': '.grid-item__duration',
        'title': '.grid-item__title',
        'host': '.grid-item__sub-title',
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
  getName: 'nostalgie_be',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
