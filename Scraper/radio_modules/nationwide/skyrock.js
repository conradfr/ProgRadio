const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');

let scrapedData = [];
let referenceIndex = 0;

// gonna be messy
const format = dateObj => {

  // we use reduce instead of map to act as a map+filter in one pass
  const cleanedData = scrapedData.reduce(function (prev, curr, index, array) {

    // Time
    let regexp = new RegExp(/([0-9]{1,2})[h|H]([0-9]{2})\s+([0-9]{1,2})[h|H]([0-9]{2})/);
    let match = curr.datetime_raw.match(regexp);

    // no time, exit
    if (match === null) {
      return prev;
    }

    const startDateTime = moment(curr.dateObj);
    const endDateTime = moment(curr.dateObj);

    startDateTime.hour(match[1]);
    startDateTime.minute(match[2]);
    startDateTime.second(0);
    endDateTime.hour(match[3]);
    endDateTime.minute(match[4]);
    endDateTime.second(0);

    let prevMatch = null;
    // keep only relevant time from previous day page
    if (startDateTime.isBefore(dateObj, 'day')) {
      if (index === 0) {
        return prev;
      }

      prevMatch = array[0].datetime_raw.match(regexp);
      array[0].dateObj.hour(prevMatch[1]);

      if (array[0].dateObj.isBefore(startDateTime)) {
        return prev;
      }

      // update day
      startDateTime.add(1, 'days');
      endDateTime.add(1, 'days');
    }
    // remove next day schedule from day page
    else {
      if (curr.dateObj !== array[index - 1].dateObj) {
        referenceIndex = index;
      } else {
        prevMatch = array[referenceIndex].datetime_raw.match(regexp);
        let prevDate = moment(array[referenceIndex].dateObj);
        prevDate.hour(prevMatch[1]);

        if (prevDate.isAfter(startDateTime)) {
          return prev;
        }
      }

      if (startDateTime.hour() > endDateTime.hour()) {
        endDateTime.add(1, 'days');
      }
    }

    newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString(),
      'img': `https:${curr.img}`
    };

    // Title - host
    regexp = new RegExp(/^([\'\w\s\A-zÀ-ÿ\|]+)\s–\s([\w\s\A-zÀ-ÿ\|\']+)/);
    match = curr.host_title.match(regexp);

    if (match === null) {
      newEntry.title = curr.host_title;
    } else {
      newEntry.host = match[1];
      newEntry.title = match[2];
    }

    prev.push(newEntry);
    return prev;
  }, []);

  return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
  dateObj.locale('fr');
  let day = dateObj.format('dddd').toLowerCase();
  let url = 'https://skyrock.fm/emissions';

  logger.log('info', `fetching ${url} (${day})`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .find(`#${day}`)
      .select('.b-list__item > a')
      .set({
        'datetime_raw': '.b-list__item__number__infos',
        'img': 'img.picture@src',
        'host_title': '.heading-3',
      })
      .data(function (listing) {
        console.log(listing);
        listing.dateObj = dateObj;
        scrapedData.push(listing);
      })
      .done(function () {
        resolve(true);
      })
  });
};

const fetchAll = dateObj => {
  /* radio schedule page has the format 3am -> 3am,
     so we get the previous day as well to get the full day and the filter the list later  */
  const previousDay = moment(dateObj);
  previousDay.subtract(1, 'days');

  return fetch(previousDay)
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
  getName: 'skyrock',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
