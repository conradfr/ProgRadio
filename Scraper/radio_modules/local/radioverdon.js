const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');

let scrapedData = [];

const format = dateObj => {
  const cleanedData = scrapedData.reduce(function (prev, entry) {
    // regexp = new RegExp(/([0-9]{1,2})[h|H]([0-9]{0-2})\s-\s([0-9]{1,2})[h|H]([0-9]{0-2})/);
    regexp = new RegExp(/([0-9]{1,2})[h|H]([0-9]{0,2})/);
    let match = entry.datetime_raw.match(regexp);

    let startDateTime = moment(dateObj);

    if (match === null) {
      return prev;
    }

    const newEntry = {
      'img': entry.img,
      'title': entry.title,
      'description': entry.description || null
    }

    startDateTime.hour(match[1]);

    if (match[2]){
      startDateTime.minute(match[2]);
    } else {
      startDateTime.minute(0);
    }

    startDateTime.second(0);

    newEntry.date_time_start = startDateTime.toISOString();

    regexp = new RegExp(/\s-\s([0-9]{1,2})[h|H]([0-9]{0,2})/);
    match = entry.datetime_raw.match(regexp);

    if (match !== null) {
      let endDateTime = moment(dateObj);

      endDateTime.hour(match[1]);

      if (match[2]){
        endDateTime.minute(match[2]);
      } else {
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
  dateObj.tz("Europe/Paris");
  dateObj.locale('fr');

  const url = 'https://radio-verdon.com/programmation-radio-verdon/';
  const dayNum = dateObj.isoWeekday();

  logger.log('info', `fetching ${url}`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .find(`.tab-content #program-tab-${dayNum} li`)
      .set({
        'datetime_raw': '.col-md-9.col-sm-9 span',
        'img': '.col-md-3.col-sm-3 img@src',
        'title': '.col-md-9.col-sm-9 h5',
        'description': '.col-md-9.col-sm-9 p'
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
  getName: 'radioverdon',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
