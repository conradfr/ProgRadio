const osmosis = require('osmosis');
let moment = require('moment-timezone');
const utils = require('../../lib/utils');
const logger = require('../../lib/logger.js');

const dayFr = {
  'lundi': 1,
  'mardi': 2,
  'mercredi': 3,
  'jeudi': 4,
  'vendredi': 5,
  'samedi': 6,
  'dimanche': 7
};

let scrapedData = {};
let cleanedData = {};

const format = (dateObj, dayWanted, name) => {
  const dayWantedStart = moment(dayWanted);
  dayWantedStart.hour(0);
  dayWantedStart.minute(0);
  dayWantedStart.second(0);

  const dayWantedEnd = moment(dayWanted);
  dayWantedEnd.hour(23);
  dayWantedEnd.minute(59);
  dayWantedEnd.second(59);

  // we use reduce instead of map to act as a map+filter in one pass
  cleanedData[name] = scrapedData[name].reduce(function (prev, curr, index, array) {
    const description_join = curr.description.join(' ').trim();
    const dayNum = dateObj.isoWeekday();

    let matched = false;

    // ---------- REGEX 1 ----------

    let regexp = new RegExp(/Du\s(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\sau\s(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)/);
    let match = description_join.match(regexp);

    if (match !== null) {
      if (dayNum < dayFr[match[1]] || dayNum > dayFr[match[2]]) {
        return prev;
      }

      matched = true;
    }

    if (matched === false) {
      if ((description_join.includes('ous les jours') === true)
          || (description_join.includes('e matin') === true)) {
        matched = true;
      }
    }

    if (matched === false) {
      if ((description_join.includes('toute la semaine') === true) &&
        (dayNum >= 1 && dayNum <= 5)) {
        matched = true;
      }
    }

    if (matched === false) {
      regexp = new RegExp(/(Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi|Dimanche)/);
      match = description_join.match(regexp);

      if (match !== null && dayNum === dayFr[match[1].toLowerCase()]) {
        matched = true;
      }
    }

    if (matched === false) {
      return prev;
    }

    regexp = new RegExp(/([0-9]{1,2})[h|H]([0-9]{0,2})\s[à|–]\s([0-9]{1,2})[h|H]([0-9]{0,2})/);
    match_time = description_join.match(regexp);

    if (match_time === null) {
      regexp = new RegExp(/([0-9]{1,2})[h|H]([0-9]{0,2})[-|–]([0-9]{1,2})[h|H]([0-9]{0,2})/);
      match_time = description_join.match(regexp);
    }

    if (match_time === null) {
      regexp = new RegExp(/([0-9]{1,2})[h|H]([0-9]{0,2})[-|–](Midi)/);
      match_time = description_join.match(regexp);
    }

    if (match_time === null) {
      return prev;
    }

    const startDateTime = moment(curr.dateObj);
    const endDateTime = moment(curr.dateObj);

    startDateTime.hour(match_time[1]);
    if (match_time[2] !== '') {
      startDateTime.minute(match_time[2]);
    } else {
      startDateTime.minute(0);
    }

    if (match_time[3] === 'Midi') {
      endDateTime.hour(12);
      endDateTime.minute(0);
    } else {
      endDateTime.hour(match_time[3]);
      if (match_time[4] !== '') {
        endDateTime.minute(match_time[4]);
      } else {
        endDateTime.minute(0);
      }
    }

    startDateTime.second(0);
    endDateTime.second(0);

    if (startDateTime.hour() > endDateTime.hour()) {
      endDateTime.add(1, 'days');
    }

    let title = curr.title;
    if (curr.title.indexOf('-') !== -1) {
      const index = curr.title.indexOf('-');
      title = curr.title.substr(0, index -1);
    }

    newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString(),
      'title': title,
      'img': curr.img,
      'description': description_join
    };

    if (moment(newEntry.date_time_start).isBetween(dayWantedStart, dayWantedEnd) === false) {
      return prev;
    }

    prev.push(newEntry);
    return prev;
  }, []);

  console.log(cleanedData[name]);

  return Promise.resolve(cleanedData[name]);
};

const fetch = (dateObj, name, url) => {
  logger.log('info', `fetching ${url}`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .find('#content-shows')
      .select('a')
      .do(
        osmosis.follow('@href')
          .set({
            'title': 'title',
            'img': '.cover-show > img@src',
            'description': ['#single-show #wrapper > p text()'],
            'host': 'div.wp-caption .wp-caption-text'
          })
      )
      .data(function (listing) {
        listing.dateObj = dateObj;
        scrapedData[name].push(listing);
      })
      .done(function () {
        resolve(true);
      })
  });
};

const fetchAll = (dateObj, dateWantedObj, name, url) => {
  const diff = dateWantedObj.utcOffset() - dateObj.utcOffset();
  const otherDayObj = moment(dateObj) ;

  // positive = after France so we need previous day + day
  // negative = before France so we need day + next day
  if (diff > 0) {
    otherDayObj.subtract(1, 'days');
  } else {
    otherDayObj.add(1, 'days');
  }

  return fetch(otherDayObj, name, url)
    .then(() => {
      return fetch(dateObj, name, url);
    });

};

const getScrap = (dateObj, dateWantedObj, name, url) => {
  dateObj.locale('fr');

  scrapedData[name] = [];
  return fetchAll(dateObj, dateWantedObj, name, url)
    .then(() => {
      return format(dateObj, dateWantedObj, name);
    });
};

const scrapModule = {
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
