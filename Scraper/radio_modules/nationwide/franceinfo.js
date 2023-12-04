const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');

let scrapedData = [];
let scrapedSectionsData = [];

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

    const newEntry = {
      sections: []
    };

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

      // sometimes we got only one section not in an array
      if (Array.isArray(curr.sections) === false) {
        curr.sections = [curr.sections];
      }

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

  // we use reduce instead of map to act as a map+filter in one pass
  const cleanedSectionsData = scrapedSectionsData.reduce(function (prev, curr) {

    // Time

    let regexp = new RegExp(/([0-9]{1,2}):([0-9]{2})/);
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

    // Title

    newEntry.title = curr.title.trim();

    prev.push(newEntry);

    return prev;
  }, []);

  // Assign sections to each show.

  for (let [index, section] of cleanedSectionsData.entries()) {
    for (let [index2, show] of cleanedData.entries()) {
      const startShow = moment(show.date_time_start);
      let endShow;

      if (cleanedData[index2 + 1] !== undefined) {
        endShow = moment(cleanedData[index2 + 1].date_time_start).subtract(1, 'seconds');
      } else {
        endShow = dateObj.endOf('day');
      }

      if (moment(section.date_time_start).isBetween(startShow, endShow) === true) {
        cleanedData[index2].sections.push(section);
        break;
      }
    }
  }

  return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
  let url = 'https://www.francetvinfo.fr/replay-radio/grille-des-emissions.html';

  logger.log('info', `fetching ${url}`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .find('.accordion__item')
      .set({
        'datetime_raw': '.accordion__head-time',
        'title_host': '.accordion__head-title'
      })
      .data(function (listing) {
        scrapedData.push(listing);
      })
      .done(function () {
        resolve(true);
      })
  });
};

const fetchSections = dateObj => {
  let url = 'https://www.francetvinfo.fr/replay-radio/grille-des-emissions.html';

  logger.log('info', `fetching ${url}`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .select('section.accordion__panel .accordion__panel-lines .accordion__panel-line')
      .set({
        'datetime_raw': '.accordion__panel-time',
        'title': '.accordion__panel-title'
      })
      .data(function (listing) {
        scrapedSectionsData.push(listing);
      })
      .done(function () {
        resolve(true);
      })
  });
};

const fetchAll = dateObj => {
  return fetch(dateObj)
    .then(() => {
      return fetchSections(dateObj);
    });
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
