// adapted from lessentielradio.js

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
  dateObj.tz('Europe/Zurich');
  dateObj.locale('fr');

  const cleanedData = scrapedData.reduce(function (prev, entry) {
    let time = [];

    let datetime_raw = Array.isArray(entry.datetime_raw) ? entry.datetime_raw[0] : entry.datetime_raw;

    let regexp = new RegExp(/^Du\s(Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi|Dimanche)\sau\s(Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi|Dimanche), de ([0-9]{1,2})[:]([0-9]{2})\sà\s([0-9]{1,2})[:]([0-9]{2})/);
    let match = datetime_raw.match(regexp);

    if (match === null) {
      // maybe it's weekend
      regexp = new RegExp(/^Le week-end, de ([0-9]{1,2})[:]([0-9]{2})\sà\s([0-9]{1,2})[:]([0-9]{2})/);
      match = datetime_raw.match(regexp);

      if (match !== null) {
        // not week-end ?
        const dayNum = dateObj.isoWeekday();
        if (dayNum !== 6 && dayNum !== 7) {
          return prev;
        }

        time = [match[1], match[2], match[3], match[4]];
      }
    } else {
      // not in day interval
      const dayNum = dateObj.isoWeekday();
      if (dayNum < dayFr[match[1]] || dayNum > dayFr[match[2]]) {
        return prev;
      }

      time = [match[3], match[4], match[5], match[6]];
    }

    // maybe it's just one day
    if (match === null) {
      regexp = new RegExp(/^(Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi|Dimanche), de ([0-9]{1,2})[:]([0-9]{2})\sà\s([0-9]{1,2})[:]([0-9]{2})/);
      match = datetime_raw.match(regexp);

      if (match === null) {
        return prev;
      }

      time = [match[2], match[3], match[4], match[5]];
    }

    let startDateTime = moment(dateObj);
    startDateTime.hour(time[0]);
    startDateTime.minute(time[1]);
    startDateTime.second(0);

    endDateTime = moment(dateObj);
    endDateTime.hour(time[2]);
    endDateTime.minute(time[3]);
    endDateTime.second(0);

    // end at midnight etc
    if (time[2] < time[0]) {
      endDateTime.add(1, 'days');
    }

    const newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString(),
      'img': `https://www.rouge.ch${entry.img}`,
      'title': entry.title.trim(),
      //'host': entry.host.join(', '),
      // 'description': entry.description.join(' '),
    };

    if (entry.description && entry.description.length > 0) {
      newEntry.description = entry.description[0].trim();
    }

    prev.push(newEntry);
    return prev;
  }, []);

  return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
  dateObj.tz('Europe/Zurich');
  dateObj.locale('fr');

  const url = 'https://www.rouge.ch/emissions';

  const day = dayFr[dateObj.isoWeekday()];

  logger.log('info', `fetching ${url} (${day})`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      // for some reason the website return a 500
      .config({
        ignore_http_errors: true
      })
      .select(`.layout-bloc.${day}`)
      .set({
        'img': 'img.list-img-thumb@src',
        'title': 'h2',
        // 'datetime_raw': '.program-date'
      })
      .do(
        osmosis.follow('a.whole-div-link@href')
          .config({
            ignore_http_errors: true
          })
          .select('.article')
          .set({
            'datetime_raw': '.wrap .program-date',
            'description': ['p'],
            //'host': ['h4']
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
  getName: 'rouge',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
