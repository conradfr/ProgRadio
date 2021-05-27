const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');

let scrapedData = [];
let referenceIndex = 0;

const format = dateObj => {
  // we use reduce instead of map to act as a map+filter in one pass
  const cleanedData = scrapedData.reduce(function (prev, curr, index, array) {
    let regexp = new RegExp(/^([0-9]{1,2})[h]([0-9]{2})\s-\s([0-9]{1,2})[h]([0-9]{2})/);
    let match = curr.datetime_raw.match(regexp);

    // no time = exit
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
      'title': curr.title.trim(),
      'description': curr.description !== undefined ? curr.description.trim() : null,
      'host': curr.host !== undefined ? curr.host.trim() : null
    };

    // temp has there is a ssl error on the server on img import for rtl
    if (curr.img !== undefined && curr.img !== null) {
      if (curr.img.startsWith('https')) {
        newEntry.img = 'http' + curr.img.substr(5);
      } else {
        newEntry.img = curr.img;
      }
    }

    prev.push(newEntry);

    return prev;
  }, []);

  return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
  let dayFormat = dateObj.format('DD-MM-YYYY');
  let url = `https://www.rtl2.fr/grille/${dayFormat}`;

  logger.log('info', `fetching ${url}`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .find('.container .card-container')
      .set({
        'datetime_raw': 'header .schedule',
        'title': 'div.title',
        'img': 'div.cover@data-bg',
        'host': 'div.subtitle'
      })
      .do(
        osmosis.follow('header > a@href')
          .set({
            'description': '.read-more-container'
          })
      )
      .data(function (listing) {
        listing.dateObj = dateObj
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
  getName: 'rtl2',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
