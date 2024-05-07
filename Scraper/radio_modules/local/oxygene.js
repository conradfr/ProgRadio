const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');
const utils = require('../../lib/utils.js');

let scrapedData = {};
let  cleanedData = {};

const dayFr = {
  'Lundi': 1,
  'Mardi': 2,
  'Mercredi': 3,
  'Jeudi': 4,
  'Vendredi': 5,
  'Samedi': 6,
  'Dimanche': 7
};

const dayNameFr = {
  'Lundi': 1,
  'Mardi': 2,
  'Mercredi': 3,
  'Jeudi': 4,
  'Vendredi': 5,
  'Samedi': 6,
  'Dimanche': 7
};

const format = (dateObj, subRadio) => {
  dateObj.tz('Europe/Paris');
  dateObj.locale('fr');

  cleanedData[subRadio] = scrapedData[subRadio].reduce(function (prev, entry) {
    // this show is more a section that is not correctly listed, remove it for now
    if (entry.title === 'La Story') {
      return prev;
    }

    let time = [];

    let regexp = new RegExp(/^Du\s(Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi|Dimanche)\sau\s(Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi|Dimanche), de ([0-9]{1,2})[:]([0-9]{2})\sà\s([0-9]{1,2})[:]([0-9]{2})/);
    let match = entry.datetime_raw.match(regexp);

    if (match === null) {
      // maybe it's weekend
      regexp = new RegExp(/^Le week-end, de ([0-9]{1,2})[:]([0-9]{2})\sà\s([0-9]{1,2})[:]([0-9]{2})/);
      match = entry.datetime_raw.match(regexp);

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
      regexp = new RegExp(/^(Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi|Dimanche)(.*), de ([0-9]{1,2})[:]([0-9]{2})\sà\s([0-9]{1,2})[:]([0-9]{2})/);
      match = entry.datetime_raw.match(regexp);

      if (match === null) {
        return prev;
      }

      const dayName = utils.upperCaseWords(dateObj.format('dddd'));
      if (match[0].indexOf(dayName) !== -1) {
        return prev;
      }

      time = [match[3], match[4], match[5], match[6]];
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
      'img': `https://www.radiooxygene.fr${entry.img}`,
      'title': entry.title,
      'host': entry.host.join(', '),
      'description': entry.description.join(' '),
    };

    prev.push(newEntry);
    return prev;
  }, []);

  return Promise.resolve(cleanedData[subRadio]);
};

const fetch = (dateObj, subRadio) => {
  const url = 'https://www.radiooxygene.fr/emissions';

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
        'datetime_raw': '.program-date'
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
        scrapedData[subRadio].push(listing);
      })
      .done(function () {
        resolve(true);
      })
  });
};

const fetchAll = (dateObj, subRadio) => {
  return fetch(dateObj, subRadio);
};

const getScrap = (dateObj, subRadio) => {
  if (!scrapedData[subRadio]) {
    scrapedData[subRadio] = [];
  }

  return fetchAll(dateObj, subRadio)
    .then(() => {
      return format(dateObj, subRadio);
    });
};

const scrapModule = {
  getName: 'oxygene',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
