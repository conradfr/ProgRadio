const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');
const {list} = require("postcss");

let scrapedData = [];

// gonna be messy
const format = dateObj => {
  // we use reduce instead of map to act as a map+filter in one pass
  const cleanedData = scrapedData.reduce(function (prev, curr, index, array) {
    const newEntry = {
      'title': curr.title.trim(),
    };

    // -------------------------------------------------- TYPE 1 --------------------------------------------------

    let regexp = new RegExp(/^([0-9]{1,2})H([0-9]{1,2})\sà\s([0-9]{1,2})H([0-9]{1,2})/);
    let match = curr.time_raw.match(regexp);

    if (match === null) {
      return prev;
    }

    const startDateTime = moment(curr.dateObj);
    startDateTime.tz('Indian/Reunion');
    startDateTime.hour(match[1]);
    startDateTime.minute(match[2]);
    startDateTime.second(0);

    const endDateTime = moment(curr.dateObj);
    endDateTime.tz('Indian/Reunion');
    endDateTime.hour(match[3]);
    endDateTime.minute(match[4]);
    endDateTime.second(0);

    newEntry.date_time_start = startDateTime.toISOString();
    newEntry.date_time_end = endDateTime.toISOString();

    prev.push(newEntry);
    return prev;
  }, []);

  // remove wrong day
  const finalShows = [];

  const dayWantedStart = moment(dateObj);
  dayWantedStart.hour(0);
  dayWantedStart.minute(0);
  dayWantedStart.second(0);

  const dayWantedEnd = moment(dateObj);
  dayWantedEnd.hour(23);
  dayWantedEnd.minute(59);
  dayWantedEnd.second(59);

  for (let [index, show] of cleanedData.entries()) {
    if (moment(show.date_time_start).isBetween(dayWantedStart, dayWantedEnd) === true) {
      finalShows.push(show);
    }
  }

  return Promise.resolve(finalShows);
};

const fetch = dateObj => {
  dateObj.locale('fr');
  let url = 'https://www.hitfm.fr/grille-de-programmation';
  const day = dateObj.format('dddd');

  logger.log('info', `fetching ${url}`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .select(`#${day} table tr`)
      .set({
        'time_raw': 'td[1]',
        'title': 'td[2]'
      })
      .data(function (listing) {
        listing.dateObj = dateObj;
        scrapedData.push(listing);
      })
      .done(function () {
        resolve(true);
      })
  });
};

const fetchAll = dateObj => {
  const otherDayObj = moment(dateObj) ;
  otherDayObj.subtract(1, 'days');

  return fetch(otherDayObj)
    .then(() => {
      return fetch(dateObj);
    });
};

const getScrap = dateObj => {
  return fetchAll(dateObj)
    .then(() => {
      return format(dateObj);
    });
};

const scrapModule = {
  getName: 'hitfm',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
