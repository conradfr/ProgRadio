const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');

let scrapedData = [];
let dayCode = null;

const format = dateObj => {

  // we use reduce instead of map to act as a map+filter in one pass
  const cleanedData = scrapedData.reduce(function (prev, curr, index, array) {

    // Time
    let regexp = new RegExp(/([0-9]{1,2}):([0-9]{1,2})/);
    let match = curr.datetime_raw.match(regexp);

    // no time, exit
    if (match === null) {
      return prev;
    }

    const startDateTime = moment(dateObj);

    startDateTime.hour(match[1]);
    startDateTime.minute(match[2]);
    startDateTime.second(0);

    newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'img': `https://www.rtl.be${curr.img}`,
      'title': curr.title
    };

    if (curr.description !== undefined && curr.description !== null && curr.description !== '') {
      newEntry.description = curr.description;
    }

    if (curr.host !== undefined && curr.host !== null && curr.host !== '') {
      regexp = new RegExp(/avec (.*)/);
      match = curr.host.match(regexp);

      if (match !== null) {
        newEntry.host = match[1];
      }
    }

    prev.push(newEntry);
    return prev;
  }, []);

  return Promise.resolve(cleanedData);
};

const find_day_nb = dateObj => {
  dateObj.locale('fr');
  const url = 'https://www.rtl.be/belrtl/page/grille-des-emissions-bel-rtl.htm';

  const daySearched = dateObj.format('DD/MM/YY');

  // logger.log('info', `fetching ${url}`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .select('.timing-grid > div')
      .set({
        'code': '@data-info',
        'date': 'h3 span',
        'day': 'h3'
      })
      .data(function (listing) {
        if (listing.date === daySearched) {
          dayCode = listing.code;
        }
      })
      .done(function () {
        if (dayCode !== null) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
  });
};

const fetch = async dateObj => {
  dateObj.locale('fr');

  await find_day_nb(dateObj);

  if (dayCode === null) {
    return null;
  }

  const url = 'https://www.rtl.be/belrtl/page/grille-des-emissions-bel-rtl.htm';

  logger.log('info', `fetching ${url}`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .find(`.grid-details[data-info="${dayCode}"]`)
      .select('.program')
      .set({
        'datetime_raw': '.program-timing',
        'img': '.program-details img@src',
        'title': 'h2 a',
        'host': '.program-details span',
        'description': 'p',
      })
      .data(function (listing) {
        scrapedData.push(listing);
      })
      .done(function () {
        resolve(true);
      });
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
  getName: 'bel_rtl',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
