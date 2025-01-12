const osmosis = require('osmosis');
let moment = require('moment-timezone');
const utils = require('../../lib/utils');
const logger = require('../../lib/logger.js');

const scrapedData = {};
const cleanedData = {};

const format = (dateObj, name) => {
  // we use reduce instead of map to act as a map+filter in one pass
  cleanedData[name] = scrapedData[name].reduce(function (prev, curr, index, array) {
    const startDateTime = moment.tz(curr.datetime_raw_start, 'YYYY-MM-DDTHH:mm:ss', 'Europe/Paris');
    const endDateTime = moment.tz(curr.datetime_raw_end, 'YYYY-MM-DDTHH:mm:ss', 'Europe/Paris');

    if (startDateTime.isAfter(dateObj, 'day')) {
      startDateTime.subtract(7, 'days');
    }

    if (endDateTime.isAfter(dateObj, 'day')) {
      endDateTime.subtract(7, 'days');
    }

    // if (previous day is sunday we need to sub 7 days)
    // if (dateObj.day() === 1 && startDateTime.day() !== dateObj.day()) {
    //   startDateTime.subtract(7, 'days');
    //   endDateTime.subtract(7, 'days');
    // }
    // keep only relevant time from previous day page

    // NOTE: there is a bug in the page, all datetimes on it have the day date even if next day,
    //       so we need to account for that

    // this is previous day
    if (startDateTime.isBefore(dateObj, 'day')) {
      if (index === 0) {
        return prev;
      }

      const firstEndTimePrevDay = moment.tz(array[0].datetime_raw_end, 'YYYY-MM-DDTHH:mm:ss', 'Europe/Paris');

      // if (previous day is sunday we need to sub 7 days)
      if (dateObj.day() === 1 && startDateTime.day() !== dateObj.day()) {
        firstEndTimePrevDay.subtract(7, 'days');
      }

      // this is previous day normal scheduling, ignoring
      if (startDateTime.isSameOrAfter(firstEndTimePrevDay)) {
        return prev;
      }

      // update day
      startDateTime.add(1, 'days');
      endDateTime.add(1, 'days');
    }
    // remove next day schedule from day page
    else {
      // if first of today, don't check
      if (prev.length > 0) {
        const firstStartTimeToday = moment.tz(prev[0].date_time_start, moment.ISO_8601, 'Europe/Paris');

        // this is next day scheduling, ignoring
        if (startDateTime.isSameOrBefore(firstStartTimeToday)) {
          return prev;
        }
      }
    }
    /*
        let regexp = new RegExp(/https:\/\/(.*)(smart\/)(.*)/);
        let match = curr.img.match(regexp);
        let img = curr.img;

        if (match !== null) {
          img = decodeURIComponent(match[3])
        }*/

    if (startDateTime.hour() > endDateTime.hour()) {
      endDateTime.add(1, 'days');
    }

    newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString(),
      'title': curr.title,
      // 'img': `${process.env.PROXY_URL}nostalgie.jpg?key=${process.env.PROXY_KEY}&url=${img}`,
      'img': curr.img || null,
      'description': curr.description
    };

    prev.push(newEntry);
    return prev;
  }, []);

  return Promise.resolve(cleanedData[name]);
};

const fetch = (url, name, dateObj) => {
  dateObj.locale('fr');
  const day = utils.upperCaseWords(dateObj.format('dddd'));
  logger.log('info', `fetching ${url}`);

  return new Promise(function (resolve, reject) {
    return osmosis
        .get(url)
        .find(`#${day}`)
        .select('.timelineShedule')
        .set({
          'datetime_raw_start': '.timelineShedule-header time[1]@datetime',
          'datetime_raw_end': '.timelineShedule-header time[2]@datetime',
          'img': '.timelineShedule-header picture.thumbnail-inner > img@data-src',
          'title': '.timelineShedule-content h3.a-heading-3',
          'description': '.timelineShedule-content p.description'
        })
        .data(function (listing) {
          scrapedData[name].push(listing);
        })
        .done(function () {
          resolve(true);
        })
  });
};

const fetchAll = (url, name, dateObj) => {
  scrapedData[name] = [];
  cleanedData[name] = [];

  /* radio schedule page has the format 3am -> 3am,
     so we get the previous day as well to get the full day and the filter the list later  */
  const previousDay = moment(dateObj);
  previousDay.subtract(1, 'days');

  return fetch(url, name, previousDay)
      .then(() => {
        return fetch(url, name, dateObj);
      });
};

const getScrap = (url, name, dateObj) => {
  return fetchAll(url, name, dateObj)
      .then(() => {
        return format(dateObj, name);
      });
};

const scrapModule = {
  getScrap
};

module.exports = scrapModule;

