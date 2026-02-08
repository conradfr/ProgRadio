const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');

let scrapedData = [];

const dayFr = {
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

    const regexp = new RegExp(/([0-9]{2})h([0-9]{2}) - ([0-9]{2})h([0-9]{2})/);
    const match =  entry['time'].match(regexp);

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

    if (entry.host) {
      entry.host = entry.host.replace(/\t/g, '');
    }

    if (
      entry.sections == null ||
      !Array.isArray(entry.sections) ||
      (entry.sections.length > 0 && typeof entry.sections[0] === 'string')
    ) {
      delete entry.sections;
    } else {
      for (let i = entry.sections.length - 1; i >= 0; i--) {
        let section = entry.sections[i];
        let matchTime = section['datetime_raw'].match(regexp);

        if (!matchTime) {
          entry.sections[i].sections.splice(i, 1);
          return;
        }

        let startDateTimeSection = moment(dateObj);
        startDateTimeSection.hour(matchTime[1]);
        startDateTimeSection.minute(matchTime[2]);
        startDateTimeSection.second(0);
        entry.sections[i].date_time_start =  startDateTimeSection.toISOString();
        delete entry.sections[i].datetime_raw;
      }
    }

    prev.push(entry);
    return prev;
  }, []);

  return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
  const url = 'https://www.europe1.fr/grille-des-programmes';

  dateObj.locale('fr');
  const day = dayFr[dateObj.isoWeekday()];

  logger.log('info', `fetching ${url} (${day})`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .find(`#panel-${day}`)
      .select('.programme-semaine')
      .set({
        'time': '.horaires-item-programme',
        'title': '.title-item-programme',
        'host': '.author-item-programme',
        'img': '.cover-item-programme > img@src',
        'sections': [
          osmosis.select('.chroniques-broadcast-grid .item-chronique')
            .set({
              'datetime_raw': '.horaires-item-chronique',
              'title': '.title-item-chronique',
              'presenter': '.author-item-chronique',
              'img': '.cover-item-chronique img@src'
            })
        //   // osmosis.select('.chroniques-broadcast-grid .item-chronique')
        //   //   .set({
        //   //     'datetime_raw': '.horaires-item-chronique',
        //   //     'title': '.title-item-chronique',
        //   //     'presenter': '.author-item-chronique',
        //   //     'img': '.cover-item-chronique img@src'
        //   //   })
        ]
      })
      // .do(
      //   osmosis.select('.chroniques-broadcast-grid .item-chronique')
      //     .set({
      //       'datetime_raw': '.horaires-item-chronique',
      //       'title': '.title-item-chronique',
      //       'presenter': '.author-item-chronique',
      //       'img': '.cover-item-chronique img@src'
      //     })
      // )
      .do(
        osmosis.follow('.item-programme > a@href')
          .set({
            'description': '.emission-description .emission-description__content > div > div:not(.visually-hidden)',
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
