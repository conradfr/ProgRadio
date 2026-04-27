const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');

let scrapedData = [];

const dayFr = {
  'lundi': 1,
  'mardi': 2,
  'mercredi': 3,
  'jeudi': 4,
  'vendredi': 5,
  'samedi': 6,
  'dimanche': 7
};

const format = dateObj => {
  dateObj.tz('Europe/Zurich');
  dateObj.locale('fr');

  const cleanedData = scrapedData.reduce(function (prev, entry) {
    if (!entry.datetime_raw || !entry.title) {
      return prev;
    }

    const dayNum = dateObj.isoWeekday();
    let matched = false;
    let skipEnd = false;

    let regexp = new RegExp(/u\s(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\sau\s(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)/);
    let match = entry.datetime_raw.match(regexp);

    if (match !== null) {
      if (dayNum < dayFr[match[1]] || dayNum > dayFr[match[2]]) {
        return prev;
      }

      matched = true;
    }

    if (matched === false) {
      regexp = new RegExp(/le (lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\set\sle\s(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)/);
      match = entry.datetime_raw.match(regexp);

      if (match !== null && (dayNum < dayFr[match[1]] || dayNum > dayFr[match[2]])) {
        return prev;
      }
    }

    if (matched === false) {
      regexp = new RegExp(/(ous les|le) (lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)/);
      match = entry.datetime_raw.match(regexp);

      if (match !== null && dayNum === dayFr[match[1]]) {
        matched = true;
      }
    }

    if (matched === false) {
      regexp = new RegExp(/(Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi|Dimanche) à/);
      match = entry.datetime_raw.match(regexp);

      if (match !== null && dayNum === dayFr[match[1]]) {
        matched = true;
      }
    }

    if (matched === false) {
      regexp = new RegExp(/(Tous les jours)/);
      match = entry.datetime_raw.match(regexp);

      if (match !== null) {
        matched = true;
      }
    }

    if (matched === false) {
      return prev;
    }

    regexp = new RegExp(/(?:de) ([0-9]{1,2})[h|H]([0-9]{0,2})/);
    let match_time = entry.datetime_raw.match(regexp);

    if (!match_time) {
      regexp = new RegExp(/(?:à|et) ([0-9]{1,2})[h|H]([0-9]{0,2})/);
      match_time = entry.datetime_raw.match(regexp);
      skipEnd = true;
    }

    if (!match_time) {
      if (entry.datetime_raw.indexOf('midi')) {
        skipEnd = true;
        match_time = [
          'midi',
          dateObj.clone().tz('Europe/Zurich').startOf('day').hour(12).utc().hour(),
          '',
        ];
      }
    }

    if (!match_time) {
      if (entry.datetime_raw.indexOf('minuit')) {
        skipEnd = true;
        match_time = [
          'minuit',
          dateObj.clone().tz('Europe/Zurich').startOf('day').hour(0).utc().hour(),
          '',
        ];
      }
    }

    if (!match_time) {
      return prev;
    }

    regexp = new RegExp(/(?:à|et) ([0-9]{1,2})[h|H]([0-9]{0,2})/);
    let match_time_end = entry.datetime_raw.match(regexp);

    let startDateTime = moment(dateObj);
    startDateTime.hour(match_time[1]);

    if (match_time[2]) {
      startDateTime.minute(match_time[2]);
    }  else {
      startDateTime.minute(0);
    }

    startDateTime.second(0);

    const newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'title': entry.title,
      'description': entry.description ? entry.description : null,
      'img': entry.img ? entry.img : null
    }

    if (!skipEnd && match_time_end) {
      const endDateTime = moment(dateObj);

      endDateTime.hour(match_time_end[1]);

      if (match_time_end[2]) {
        endDateTime.minute(match_time_end[2]);
      }  else {
        endDateTime.minute(0);
      }

      endDateTime.second(0);

      newEntry.date_time_end = endDateTime.toISOString();
    }

    prev.push(newEntry);
    return prev;
  }, []);

  return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
  const url = 'https://www.rts.ch/audio-podcast/emissions/rts-couleur3/';

  dateObj.tz('Europe/Zurich');
  dateObj.locale('fr');

  logger.log('info', `fetching ${url}`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .select('.az-list .item')
      .do(
        osmosis.follow('a.portal-az-card@href')
          .set({
            'datetime_raw': '.timeframe span',
            'title': 'h1.media-title',
            'img': 'img.embed-responsive-item@src',
            'description': '.headline-audio-info p'
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
  getName: 'couleur3',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
