const osmosis = require('osmosis');
let moment = require('moment-timezone');
const utils = require('../../lib/utils');
const logger = require('../../lib/logger.js');

let scrapedData = [];

// gonna be messy
const format = dateObj => {
  // we use reduce instead of map to act as a map+filter in one pass
  const cleanedData = scrapedData.reduce(function (prev, curr, index, array) {
    // we use datOfYear() because the dates on nrjpage are not accurate (next week etc)

    startDateTime = moment(curr.datetime_raw_start, "YYYY-MM-DDTHH:mm:ss", "Europe/Paris");
    startDateTime.dayOfYear(curr.dateObj.dayOfYear());

    endDateTime = moment(curr.datetime_raw_end, "YYYY-MM-DDTHH:mm:ss", "Europe/Paris");
    endDateTime.dayOfYear(curr.dateObj.dayOfYear());

    // keep only relevant time from previous day page

    // NOTE: there is a bug in the NRJ page, all datetimes on it have the day date even if next day,
    //       so we need to account for that

    // this is previous day
    if (startDateTime.isBefore(dateObj, 'day')) {
      if (index === 0) {
        return prev;
      }

      const firstEndTimePrevDay = moment(array[0].datetime_raw_end, "YYYY-MM-DDTHH:mm:ss", "Europe/Paris");
      firstEndTimePrevDay.dayOfYear(array[0].dateObj.dayOfYear());

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
        const firstStartTimeToday = moment(prev[0].date_time_start, moment.ISO_8601, "Europe/Paris");

        // this is next day scheduling, ignoring
        if (startDateTime.isSameOrBefore(firstStartTimeToday)) {
          return prev;
        }
      }
    }

    let regexp = new RegExp(/https:\/\/(.*)(smart\/)(.*)/);
    let match = curr.img.match(regexp);
    let img = curr.img;

    if (match !== null) {
      img = decodeURIComponent(match[3])
    }

    if (startDateTime.hour() > endDateTime.hour()) {
      endDateTime.add(1, 'days');
    }

    newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString(),
      'title': curr.title,
      'img': img,
      'description': curr.description
    };

    prev.push(newEntry);
    return prev;
  }, []);

  return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
  dateObj.locale('fr');
  let day = utils.upperCaseWords(dateObj.format('dddd'));
  let url = 'https://www.cheriefm.fr/grille-emissions';
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
  getName: 'cherie',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
