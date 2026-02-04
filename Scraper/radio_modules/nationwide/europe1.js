const osmosis = require('osmosis');
let moment = require('moment-timezone');
let util = require('util');
const logger = require('../../lib/logger.js');

let scrapedData = [];

const dayEn = {
  1: 'lundi',
  2: 'mardi',
  3: 'mercredi',
  4: 'jeudi',
  5: 'vendredi',
  6: 'samedi',
  7: 'dimanche'
};

const format = dateObj => {
  dateObj.tz('Europe/Paris');
  const cleanedData = scrapedData.reduce(function (prev, entry) {
    let startDateTime = moment(dateObj);
    const endDateTime = moment(dateObj);

    let regexp = new RegExp(/([0-9]{2})h([0-9]{2}) - ([0-9]{2})h([0-9]{2})/);
    let match =  entry['time'].match(regexp);

    if (!match) {
      return prev;
    }

    startDateTime.hour(match[1]);
    startDateTime.minute(match[2]);
    startDateTime.second(0);
    endDateTime.hour(match[3]);
    endDateTime.minute(match[4]);
    endDateTime.second(0);

    if (startDateTime.hour() > endDateTime.hour()) {
      endDateTime.add(1, 'days');
    }

    delete entry['time'];
    entry.date_time_start = startDateTime.toISOString();
    entry.date_time_end = endDateTime.toISOString();

    entry.sections = [];

    prev.push(entry);
    return prev;
  }, []);

  console.log(cleanedData);
  return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
  const url = 'https://www.europe1.fr/grille-des-programmes';

  dateObj.locale('fr');
  const day = dayEn[dateObj.day()];

  logger.log('info', `fetching ${url} (${day})`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .find(`#panel-${day}`)
      .select('.week-programme')
      .set({
        'time': '.horaires-item-programme',
        'title': '.title-item-programme',
        'host': '.author-item-programme',
        'img': '.cover-item-programme > img@src',
      })
      .do(
        osmosis.follow('.item-programme > a@href')
          .set({
            // 'description': '.emission-description__content > div',
            'test': '.animator-link'
          })
      )
      .data(function (listing) {
        scrapedData.push(listing);
        console.log(listing);
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
  getName: 'europe1',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
