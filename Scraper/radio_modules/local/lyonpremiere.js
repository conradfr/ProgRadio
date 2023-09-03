const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');
const utils = require('../../lib/utils');
const fixUtf8 = require('fix-utf8');

let scrapedData = [];

const format = dateObj => {
  dateObj.tz("Europe/Paris");
  dateObj.locale('fr');
  const dayString = utils.upperCaseWords(dateObj.format('dddd'));

  const cleanedData = scrapedData.reduce(function (prev, entry) {
    if (entry.days.indexOf(dayString) === -1) {
      return prev;
    }

    regexp = new RegExp(/([0-9]{1,2})[h|H]([0-9]{2})\s([0-9]{1,2})[h|H]([0-9]{2})/);
    let match = entry.datetime_raw.match(regexp);

    if (match === null) {
      return;
    }

    let startDateTime = moment(dateObj);
    startDateTime.hour(match[1]);
    startDateTime.minute(match[2]);
    startDateTime.second(0);

    endDateTime = moment(dateObj);
    endDateTime.hour(match[3]);
    endDateTime.minute(match[4]);
    endDateTime.second(0);

    const newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString(),
      'img': entry.img,
      'title': entry.title,
      'description': entry.description_alt
    }

    if (entry.description !== undefined && entry.description !== null && entry.description !== '') {
      const description = fixUtf8(entry.description).replace(/ /g, ' ').replace(/\s\s+/g, ' ');
      if (description !== '') {
        newEntry.description = description;
      }
    }

    prev.push(newEntry);
    return prev;
  }, []);

  return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
  const url = 'https://www.lyonpremiere.fr/grille-des-programmes/';

  logger.log('info', `fetching ${url}`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .find('#programme-items .programme-item')
      // .select('.item')
      .set({
        'days': '@data-filter',
        'datetime_raw': '.programme-thumbnail .programme-time-slots',
        'img': '.programme-thumbnail img@data-src',
        'title': '.programme-infos .programme-name',
        'description_alt': '.programme-infos .programme-content'
      })
      .do(
        osmosis.follow('.programme-infos > a@href')
          .find('div[data-elementor-type="single-post"] .elementor-element-populated .elementor-widget[data-widget_type="theme-post-content.default"]')
          .set({
            'description': '.elementor-widget-container'
          })
      )
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
  getName: 'lyonpremiere',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
