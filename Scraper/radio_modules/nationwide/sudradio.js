const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');

let scrapedData = [];

const format = dateObj => {

  // we use reduce instead of map to act as a map+filter in one pass
  const cleanedData = scrapedData.reduce(function (prev, curr, index, array) {

    // Time
    const regexp = new RegExp(/([0-9]{1,2})[h|H]([0-9]{2})/);
    let match = curr.datetime_raw_start.match(regexp);

    // no time, exit
    if (match === null) {
      return prev;
    }

    const startDateTime = moment(curr.dateObj);

    startDateTime.hour(match[1]);
    startDateTime.minute(match[2]);
    startDateTime.second(0);

    match = curr.datetime_raw_end.match(regexp);
    const endDateTime = moment(curr.dateObj);

    if (match !== null) {
      endDateTime.hour(match[1]);
      endDateTime.minute(match[2]);
      endDateTime.second(0);
    }

    let prevMatch = null;
    // keep only relevant time from previous day page
    if (startDateTime.isBefore(dateObj, 'day')) {
      if (index === 0) {
        return prev;
      }

      prevMatch = array[0].datetime_raw_start.match(regexp);
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
        prevMatch = array[referenceIndex].datetime_raw_start.match(regexp);
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
      'host': curr.host !== undefined ? curr.host.replace(/\s\s+/g, ' ') : null,
      'title': curr.title.trim(),
      'description': curr.description !== undefined ? curr.description.replace(/\s\s+/g, ' ') : null,
      'img': curr.img !== undefined ? curr.img.trim() : null
    };

    if (Array.isArray(curr.sub) && typeof curr.sub[0] !== 'string') {
      sections = [];

      curr.sub.forEach(function (entry) {
        let match = entry.datetime_raw.match(regexp);
        if (match !== null) {
          const startDateTime = moment(curr.dateObj);
          startDateTime.hour(match[1]);
          startDateTime.minute(match[2]);
          startDateTime.second(0);

          let secEntry = {
            date_time_start: startDateTime,
            title: entry.title.trim(),
            // description: entry.description,
            img: entry.img !== undefined ? entry.img.trim() : null,
            presenter: entry.presenter !== undefined ? entry.presenter.trim() : null

          };

          sections.push(secEntry);
        }
      });

      newEntry.sections = sections;
    }

    prev.push(newEntry);
    return prev;
  }, []);

  return Promise.resolve(cleanedData);
};

const fetch = (dateObj, url) => {
  dateObj.locale('en');
  const dayFormat = dateObj.format('ddd').toLowerCase();

  logger.log('info', `fetching ${url}`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .find(`#nav-${dayFormat}`)
      .select('ol.list-unstyled li.sud-schedule__show')
      .set({
        'img': 'img.sud-show__thumbnail-image@src',
        'datetime_raw_start': 'time.sud-show__meta-date-start',
        'datetime_raw_end': 'time.sud-show__meta-date-end',
        'title': 'h3 > a',
        'host': 'address',
        'description': '.sud-show__excerpt.sud-excerpt p',
        'sub': [
          osmosis.select('section.sud-podcast header')
            .set({
              'datetime_raw': 'time.sud-podcast__meta-date-start',
              'title': 'h4 a',
              // 'description': '.step-list-element-content-editorial-infos-title h3',
              'presenter': 'address'
            })
        ]
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
  const url = 'https://www.sudradio.fr/programmes/';

  /* radio schedule page has the format 5am -> 5am,
     so we get the previous day as well to get the full day and the filter the list later  */
  const previousDay = moment(dateObj);
  previousDay.subtract(1, 'days');

  const today = moment();
  today.tz('Europe/Paris');

  const isToday = today.isSame(dateObj, 'day');

  let prevDayQuery = '';
  let dayQuery = '';

  // if monday asked and it's today we need to go back with url for prev day
  if (isToday === true && dateObj.weekday() === 1) {
    prevDayQuery = '?week=-1';
  }

  // if monday asked but today is sunday we need to go next week for url
  if (isToday === false && dateObj.weekday() === 1) {
    dayQuery = '?week=1';
  }

  return fetch(previousDay, url + prevDayQuery)
    .then(() => {
      return fetch(dateObj, url + dayQuery);
    });
};

const getScrap = dateObj => {
  return fetchAll(dateObj)
    .then(() => {
      return format(dateObj);
    });
};

const scrapModule = {
  getName: 'sudradio',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
