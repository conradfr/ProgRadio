const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');

let scrapedData = [];

const format = dateObj => {

  // we use reduce instead of map to act as a map+filter in one pass
  const cleanedData = scrapedData.reduce(function (prev, curr, index, array) {
    let regexp = new RegExp(/^([0-9]{1,2})h(.|\n)*/);
    let match = curr.datetime_raw.match(regexp);

    regexp = new RegExp(/([0-9]{1,2})h$/);
    let match2 = curr.datetime_raw.match(regexp);

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
    endDateTime.hour(match2[1]);
    endDateTime.minute(0);
    endDateTime.second(0);

    if (startDateTime.hour() > endDateTime.hour()) {
      endDateTime.add(1, 'days');
    }

    newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString(),
      'description': curr.description,
      'title': `${startDateTime.format('HH')}h / ${endDateTime.format('HH')}h`,
      'img': curr.img
    };

    prev.push(newEntry);
    return prev;
  }, []);

  return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
  const url = `https://www.funradio.be/emissions/?d=${dateObj.format('ddd')}`;

  logger.log('info', `fetching ${url}`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .select('.show-item')
      .set({
        'img': '.show-name@src',
        'datetime_raw': '.show-time',
        'description': '.show-description',
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
  dateObj.tz('Europe/Brussels');
  return fetch(dateObj);
};

const getScrap = dateObj => {
  return fetchAll(dateObj)
    .then(() => {
      return format(dateObj);
    });
};

const scrapModule = {
  getName: 'funradio_be',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
