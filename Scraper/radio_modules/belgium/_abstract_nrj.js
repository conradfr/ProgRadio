const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');

const scrapedData = {};
const cleanedData = {};

const format = (name, dateObj) => {
  // we use reduce instead of map to act as a map+filter in one pass
  cleanedData[name] = scrapedData[name].reduce(function (prev, curr, index, array) {
    let regexp = new RegExp(/^([0-9]{1,2})H([0-9]{1,2})/);
    let match = curr.datetime_raw.match(regexp);

    // no time = exit
    if (match === null) {
      return prev;
    }

    const startDateTime = moment(curr.dateObj);

    startDateTime.hour(match[1]);
    startDateTime.minute(match[2]);
    startDateTime.second(0);

    newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'title': curr.title,
      'description': curr.description_alt || curr.description,
      'img': curr.img,
    };

    if (curr.host) {
      newEntry.host = curr.host.replace(/Avec/g, '').replace(/\n/g, '').replace(/\s+/g, ' ').replace(/\s*,\s*/g, ', ').trim()
    }

    prev.push(newEntry);
    return prev;
  }, []);

  return Promise.resolve(cleanedData[name]);
};

const fetch = (url, name, dateObj) => {
  const format = 'YYYY-MM-DD';
  const dateStr = dateObj.format(format)
  url = `${url}?date=${dateStr}`;

  logger.log('info', `fetching ${url}`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .find('ul.list-prog-grid-item')
      .select('li .prog-grid-item')
      .set({
        'img': '.img-fluid@data-src',
        'datetime_raw': '.prog-grid-item__time > div',
        'title': '.prog-grid-item__text h2',
        'description': '.prog-grid-item__text p',
      })
      .do(
        osmosis.follow('a.prog-grid-item__main@href')
          .find('.card-podcast-episode-header__text')
          .set({
            'description_alt': 'p:nth-child(2)',
            'host': 'p:first-child'
          })
      )
      .data(function (listing) {
        scrapedData[name].push(listing);
      })
      .done(function () {
        resolve(true);
      })
  });
};

const fetchAll =(url, name, dateObj) => {
  scrapedData[name] = [];
  cleanedData[name] = [];
  return fetch(url, name, dateObj);
};

const getScrap = (url, name, dateObj) => {
  dateObj.tz('Europe/Brussels');
  return fetchAll(url, name, dateObj)
    .then(() => {
      return format(name, dateObj);
    });
};

const scrapModule = {
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
