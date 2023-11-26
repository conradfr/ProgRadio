const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');
const utils = require("../../lib/utils");

let scrapedData = [];

const format = dateObj => {
  dateObj.tz('Europe/Zurich');
  dateObj.locale('fr');

  const cleanedData = scrapedData.reduce(function (prev, entry) {
    let regexp = new RegExp(/([0-9]{1,2})[h|H]([0-9]{2})/);
    let match_time = entry.datetime_raw.match(regexp);

    if (!match_time) {
      return prev;
    }

    let startDateTime = moment(dateObj);
    startDateTime.hour(match_time[1]);
    startDateTime.minute(match_time[2]);
    startDateTime.second(0);

    const newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'title': utils.upperCaseWords(entry.title),
      'description': entry.description || null,
      'img': entry.img ? `https://radiochablais.ch${entry.img}` : null
    }

    if (entry.host && entry.host !== '') {
      newEntry.host = entry.host.substring(5);
    }

    prev.push(newEntry);
    return prev;
  }, []);

  return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
  const url = 'https://radiochablais.ch/radio/grille-des-programmes';

  dateObj.tz('Europe/Zurich');
  dateObj.locale('fr');

  logger.log('info', `fetching ${url}`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .find(`div.tabcontent#${dateObj.isoWeekday()}`)
      .select('.emission')
      .set({
        'datetime_raw': '.emission_time',
        'img': '.emission_image img@src',
        'host': '.animateurs',
        'title': '.emission_nom',
        'description': '.emission_descr'
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
  getName: 'radiochablais',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
