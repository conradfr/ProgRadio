const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');

let scrapedData = [];

const format = dateObj => {

  // we use reduce instead of map to act as a map+filter in one pass
  const cleanedData = scrapedData.reduce(function (prev, curr, index, array) {
    let regexp = new RegExp(/^([0-9]{1,2})H/);
    let match = curr.datetime_raw.match(regexp);

    // no time = exit
    if (match === null) {
      return prev;
    }

    const startDateTime = moment(curr.dateObj);

    startDateTime.hour(match[1]);
    startDateTime.minute(0);
    startDateTime.second(0);

    newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'title': curr.title,
      'description': curr.description,
      'img': curr.img
    };

    prev.push(newEntry);
    return prev;
  }, []);

  return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
  const url = 'https://www.nrj.be/nrjplus/emissions';
  const dayNb = dateObj.isoWeekday() - 1;

  logger.log('info', `fetching ${url}`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .find(`#nav-${dayNb}`)
      .select('.grid-item')
      .set({
        'img': '.img-fluid@data-src',
        'datetime_raw': '.grid-item__time > .grid-item__bullet',
        'title': '.grid-item__text > h2',
        'description': '.grid-item__text > p',
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
  dateObj.tz('Europe/Brussels');
  return fetchAll(dateObj)
    .then(() => {
      return format(dateObj);
    });
};

const scrapModule = {
  getName: 'nrj_plus_be',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
