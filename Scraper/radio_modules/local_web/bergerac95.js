// COPIED FROM L'ESSENTIEL

const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');
const utils = require('../../lib/utils');

let scrapedData = [];

const format = dateObj => {
  dateObj.tz("Europe/Paris");
  dateObj.locale('fr');

  const cleanedData = scrapedData.reduce(function (prev, entry) {
    // this show is more a section that is not correctly listed, remove it for now
    if (entry.title === 'Votre journal' || entry.title === 'Agenda sportif' || entry.title === 'Les infos locales avec Emilie') {
      return prev;
    }

    let regexp = new RegExp(/([0-9]{1,2})[:]([0-9]{2})\sà\s([0-9]{1,2})[:]([0-9]{2})/);
    let match = entry.datetime_raw.match(regexp);

    if (match === null) {
      return prev;
    }

    // not in day interval
    if (entry.datetime_raw.includes(utils.upperCaseWords(dateObj.format('dddd'))) === false) {
      return prev;
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
      'img': `http://www.bergerac95.fr${entry.img}`,
      'title': entry.title,
      'host': entry.host.join(', '),
      'description': entry.description.join(' '),
    };

    if (newEntry.host === '') {
      delete newEntry.host;
    }

    return prev;
  }, []);

  return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
  const url = 'https://www.bergerac95.fr/emissions';

  logger.log('info', `fetching ${url}`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      // for some reason the website return a 500
      .config({
        ignore_http_errors: true
      })
      .select('.list_element')
      .set({
        'img': 'img.list-img-thumb@src',
        'title': 'h4',
        'datetime_raw': 'a.title-link + div'
      })
      .do(
        osmosis.follow('a.title-link@href')
          .config({
            ignore_http_errors: true
          })
          .select('.article')
          .set({
            'description': ['p'],
            'host': ['h4']
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
