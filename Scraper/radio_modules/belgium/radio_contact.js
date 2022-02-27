const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');

let scrapedData = [];

const format = dateObj => {

  // we use reduce instead of map to act as a map+filter in one pass
  const cleanedData = scrapedData.reduce(function (prev, curr, index, array) {

    // Time
    const regexp = new RegExp(/([0-9]{1,2})[h|H]([0-9]{1,2})/);
    const match = curr.datetime_raw.match(regexp);

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
      'img': curr.img,
      'description': curr.description
    };

    if (curr.title !== undefined && curr.title !== null && curr.title !== '') {
      newEntry.title = curr.title;
    }
    if (curr.title_alt !== undefined && curr.title_alt !== null && curr.title_alt !== '') {
      newEntry.title = curr.title_alt;
    } else {
      return prev;
    }

    prev.push(newEntry);
    return prev;
  }, []);

  return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
  dateObj.locale('fr');
  const day = dateObj.format('YYYY-MM-DD');
  const url = `https://www.radiocontact.be/la-grille-des-programmes/?d=${day}`;

  logger.log('info', `fetching ${url}`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .select('.program')
      .set({
        'datetime_raw': '.program-timeline-start',
        'img': '.program-media-picture img@src',
        'title': '.program-title a',
        'title_alt': '.program-title',
        'description': '.program-text',
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
  getName: 'radio_contact',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
