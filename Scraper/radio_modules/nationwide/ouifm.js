const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');

let scrapedData = [];

const format = dateObj => {
  // we use reduce instead of map to act as a map+filter in one pass
  const cleanedData = scrapedData.reduce(function (prev, curr) {

    let match = null;
    const startDateTime = moment(curr.dateObj);
    let endDateTime = null;

    if (typeof curr.datetime_raw !== 'undefined' && typeof curr.datetime_raw !== 'object') {  /* object to be worked out later */
      let regexp = new RegExp(/De ([0-9]{1,2})[h|H]\sà\s([0-9]{1,2})[h|H] sur OÜI FM/);
      match = curr.datetime_raw.match(regexp);
    }

    if (match === null) {
      startDateTime.hour(curr.datetime_alt.substr(0, 2));
    } else {
      startDateTime.hour(match[1]);

      endDateTime = moment(curr.dateObj);
      endDateTime.hour(match[2]);
      endDateTime.minute(0);
      endDateTime.second(0);

      if (startDateTime.hour() > endDateTime.hour()) {
        endDateTime.add(1, 'days');
      }
    }

    startDateTime.minute(0);
    startDateTime.second(0);

    delete curr.datetime_alt;
    delete curr.datetime_raw;

    if (endDateTime !== null) {
      curr.date_time_end = endDateTime.toISOString();
    }

    curr.date_time_start = startDateTime.toISOString();

    prev.push(curr);
    return prev;
  }, []);

  return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
  let url = 'https://www.ouifm.fr/grille-des-programmes/';
  dateObj.tz("Europe/Paris");
  const day = dateObj.isoWeekday();

  logger.log('info', `fetching ${url}`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .find(`#daygrid${day} > .emission`)
      .set({
        'datetime_alt': 'span.horaire',
        'title': 'h2',
        'img': 'img.badge@src',
        'host': 'h3'
      })
      .do(
        osmosis.follow('a@href')
          .find('.single > p')
          .set({
            'datetime_raw': 'strong',
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
  getName: 'ouifm',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
