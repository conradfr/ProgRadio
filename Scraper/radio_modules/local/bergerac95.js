// COPIED FROM L'ESSENTIEL

const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');
const utils = require('../../lib/utils');

const dayFr = {
  'lundi': 1,
  'mardi': 2,
  'mercredi': 3,
  'jeudi': 4,
  'vendredi': 5,
  'samedi': 6,
  'dimanche': 7
};

let scrapedData = [];

const format = dateObj => {
  dateObj.tz("Europe/Paris");
  dateObj.locale('fr');

  const cleanedData = scrapedData.reduce(function (prev, entry) {
    // this show is more a section that is not correctly listed, remove it for now
    if (entry.title === 'Votre journal' || entry.title === 'Agenda sportif' || entry.title === 'Les infos locales avec Emilie') {
      return prev;
    }

    let regexp = new RegExp(/([0-9]{1,2})h – ([0-9]{1,2})h/);
    let match = entry.title.match(regexp);

    if (match === null) {
      return prev;
    }

    if (entry.days.indexOf(utils.upperCaseWords(dateObj.format('dddd'))) === -1) {
      return prev;
    }

    const charLimit = entry.title.indexOf(':');
    const title = entry.title.substr(0, charLimit - 1);


    let startDateTime = moment(dateObj);
    startDateTime.hour(match[1]);
    startDateTime.minute(0);
    startDateTime.second(0);

    endDateTime = moment(dateObj);
    endDateTime.hour(match[2]);
    endDateTime.minute(0);
    endDateTime.second(0);

    const newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString(),
      'img': entry.img,
      'title': title,
      'description': entry.description,
    };

    if (newEntry.host === '') {
      delete newEntry.host;
    }

    prev.push(newEntry);
    return prev;
  }, []);

  return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
  const url = 'https://bergerac95.fr/emissions';

  logger.log('info', `fetching ${url}`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      // for some reason the website return a 500
      .config({
        ignore_http_errors: true
      })
      .find('.elementor-portfolio-item')
      // .select('.item')
      .set({
        'days': '@data-filter',
        'datetime_raw': '.programme-thumbnail .programme-time-slots',
        'img': '.elementor-portfolio-item__img img@data-src',
      })
      .do(
        osmosis.follow('a.elementor-post__thumbnail__link@href')
          .find('#content article')
          .set({
            'days': ['li.meta-cat a'],
            'title': '.single-post-title.entry-title',
            'description': '.entry-content.clr > p'
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
  getName: 'bergerac95',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
