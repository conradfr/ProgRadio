const osmosis = require('osmosis');
let moment = require('moment-timezone');
let util = require('util');
const logger = require('../../lib/logger.js');

let scrapedData = [];

const dayEn = {
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
  7: 'dimanche'
};

const format = dateObj => {
  dateObj.tz('Europe/Paris');
  const cleanedData = scrapedData.reduce(function (prev, entry) {
    if (!entry['time']) {
      return prev;
    }

    let startDateTime = moment(dateObj);
    const endDateTime = moment(dateObj);

    let regexp = new RegExp(/([0-9]{2}):([0-9]{2}).*([0-9]{2}):([0-9]{2})/);
    let matched;
    let match;

    for (let i = 0; i < entry['time'].length; i++) {
      if (typeof entry['time'][i] === 'object') {
        match = entry['time'][i].join('').replace(/(\r\n|\n|\r)/gm, '').trim().match(regexp);
      } else {
        match = entry['time'][i].replace(/(\r\n|\n|\r)/gm, '').trim().match(regexp);
      }

      if (match !== null) {
        matched = true;
        startDateTime.hour(match[1]);
        startDateTime.minute(match[2]);
        startDateTime.second(0);
        endDateTime.hour(match[3]);
        endDateTime.minute(match[4]);
        endDateTime.second(0);

        break;
      }
    }

    if (!matched) {
      return prev;
    }

    if (startDateTime.hour() > endDateTime.hour()) {
      endDateTime.add(1, 'days');
    }

    delete entry.time;
    entry.date_time_start = startDateTime.toISOString();
    entry.date_time_end = endDateTime.toISOString();

    entry.sections = [];

    if (entry.sub && typeof entry.sub === 'object' && typeof entry.sub.length === 'number') {
      regexp = new RegExp(/([0-9]{2})h([0-9]{2}).*/);

      entry.sub.forEach(function (element) {
        if (element.time) {
          match = element.time.match(regexp);

          if (match !== null) {
            startDateTime = moment(dateObj);
            startDateTime.hour(match[1]);
            startDateTime.minute(match[2]);
            startDateTime.second(0);

            entry.sections.push({
              'title': element.title,
              'date_time_start': startDateTime.toISOString(),
              'presenter': element.presenter,
              'img': element.img
            });
          }
        }
      });
    }

    delete entry.sub;

    prev.push(entry);
    return prev;
  }, []);

  return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
  const url = 'https://www.europe1.fr/Grille-des-programmes';

  dateObj.locale('fr');
  const day = dayEn[dateObj.day()];

  logger.log('info', `fetching ${url} (${day})`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .find(`div[data-name="${day}"] > .content-switch > section`)
      .set({
        'sub': [
          osmosis.select('.swiper-wrapper .card-media')
              .set({
                'img': 'picture img@src',
                'time': '.time-range',
                'title': '.card-media__title a',
                'presenter': '.card-media__presenter'
              })
        ]
      })
      .do(
        osmosis.follow('.card-media__live .card-media__title > a@href')
          .find('.hero-content')
          .set({
            'img': 'picture img@src',
            'title': '.hero-header h1',
            'host': '.hero-authors a',
            'time': ['.tags__no-link span'],
            'description': '.hero-description p',
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
  getName: 'europe1',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
