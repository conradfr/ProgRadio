const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');

let scrapedData = [];

const format = dateObj => {
  // we use reduce instead of map to act as a map+filter in one pass
  const cleanedData = scrapedData.reduce(function (prev, curr) {

    // Time

    let regexp = new RegExp(/([0-9]{1,2})[h|H]([0-9]{2})/);
    let match = curr.datetime_raw.match(regexp);

    // no time, exit
    if (match === null) {
      return prev;
    }

    const newEntry = {};

    const startDateTime = moment(dateObj);
    startDateTime.tz(dateObj.tz());
    startDateTime.hour(match[1]);
    startDateTime.minute(match[2]);
    startDateTime.second(0);

    // filter other days (i.e last line is midnight next day)
    if (prev.length > 0 && startDateTime.isBefore(moment(prev[prev.length - 1].date_time_start))) {
      return prev;
    }

    newEntry.date_time_start = startDateTime.toISOString();

    // Title & host

    regexp = new RegExp(/^([\w\s\A-zÀ-ÿ\|]+):([\w\s\A-zÀ-ÿ\-]*)/);
    match = curr.title_host.match(regexp);

    if (match === null) {
      regexp = new RegExp(/^([\w\s\A-zÀ-ÿ]+)\|([\s\A-zÀ-ÿ\-]+)/);
      match = curr.title_host.match(regexp);
      if (match !== null && match[2].trim() === '') {
        match = null;
      }
    }

    // no host
    if (match === null) {
      newEntry.title = curr.title_host.trim();
    } else {
      newEntry.title = match[1];
      if (match[2] === ' Minuit') {
        newEntry.title = newEntry.title + ' |' + match[2];
      } // quick hack ...
      else {
        newEntry.host = match[2] || '';
      }
    }

    if (curr.hasOwnProperty('sections')) {
      newEntry.sections = [];
      curr.sections.forEach(function (section) {
        if (section.title.substr(0, 8) !== "L'info à") {
          let regexp = new RegExp(/([0-9]{1,2})[h|H]([0-9]{2})/);
          let match = section.datetime_raw.match(regexp);

          if (match !== null) {
            const newSection = {};

            const startDateTime = moment(dateObj);
            startDateTime.tz(dateObj.tz());
            startDateTime.hour(match[1]);
            startDateTime.minute(match[2]);
            startDateTime.second(0);

            newSection.date_time_start = startDateTime.toISOString();
            newSection.title = section.title;

            newEntry.sections.push(newSection);
          }
        }
      });
    }

    prev.push(newEntry);

    return prev;
  }, []);

  return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
  let url = 'https://www.francetvinfo.fr/replay-radio/grille-des-emissions';

  logger.log('info', `fetching ${url}`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .find('.program__grid__line')
      .set({
        'datetime_raw': '.program__grid__line__time',
        'title_host': '.program__grid__line__right > span',
        'sections': osmosis.select('.program__grid__sublines .program__grid__subline')
          .set({
            'datetime_raw': '.program__grid__line__time',
            'title': '.program__grid__line__right__title'
          })
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
  getName: 'franceinfo',
  supportTomorrow: false,
  getScrap
};

module.exports = scrapModule;
