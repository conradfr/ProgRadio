const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');

const scrapedData = {};
const cleanedData = {};
let referenceIndex = 0;

const format = (dateObj, name, cutOffHour) => {
  // we use reduce instead of map to act as a map+filter in one pass
  cleanedData[name] = scrapedData[name].reduce(function (prev, curr, index, array) {
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
      // if (index === 0) {
      //   return prev;
      // }

      // cutoff jour is an hour limit to avoid false positive (due to osmosis random sort)
      if (startDateTime.hour() > cutOffHour) {
        return prev;
      }

      // update day
      startDateTime.add(1, 'days');
      endDateTime.add(1, 'days');
    }
    // remove next day schedule from day page
    else {
      if (startDateTime.hour() < cutOffHour) {
        return prev;
      }

/*      if (curr.dateObj !== array[index - 1].dateObj) {
        referenceIndex = index;
      } else {
        prevMatch = array[referenceIndex].datetime_raw.match(regexp);
        let prevDate = moment(array[referenceIndex].dateObj);
        prevDate.hour(prevMatch[1]);

        if (prevDate.isAfter(startDateTime)) {
          return prev;
        }
      }*/

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

    // sections

    if (curr.sections !== undefined && curr.sections !== null
      && (curr.sections.length > 1 || (curr.sections.length > 0 && typeof curr.sections[0] !== 'string'))) {

      newEntry.sections = [];

      curr.sections.forEach(function (section) {
          regexp = new RegExp(/([0-9]{1,2})[h|H]([0-9]{2})/);
          match = section.datetime_raw.match(regexp);
          if (match !== null) {
            const newSection = {};

            const sectionStartDateTime = moment(curr.dateObj);

            sectionStartDateTime.tz(dateObj.tz());

            sectionStartDateTime.hour(match[1]);
            sectionStartDateTime.minute(match[2]);
            sectionStartDateTime.second(0);

            newSection.date_time_start = sectionStartDateTime.toISOString();
            newSection.title = section.title.trim() || null;

            if (section.presenter !== undefined && section.presenter !== null) {
              newSection.presenter = section.presenter.trim();
            }

            if (section.description !== undefined && section.description !== null) {
              newSection.description = section.description.trim() || null;
            }

            if (section.img_alt !== undefined && section.img_alt !== null && section.img_alt !== '') {
              newSection.img = section.img_alt;
            } else if (section.img !== undefined && section.img !== null && section.img !== '') {
              newSection.img = section.img;
            }

            // temp has there is a ssl error on the server on img import for rtl
            if (newSection.img !== undefined && newSection.img !== null) {
              if (newSection.img.startsWith('https')) {
                newSection.img = 'http' + newSection.img.substr(5);
              }
            }

            newEntry.sections.push(newSection);
          }
      });
    }

    prev.push(newEntry);

    return prev;
  }, []);

  return Promise.resolve(cleanedData[name]);
};

const fetch = (url, name, dateObj) => {
  let dayFormat = dateObj.format('DD-MM-YYYY');
  url = `${url}/${dayFormat}`;

  logger.log('info', `fetching ${url}`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .find('.container .card-container')
      .set({
        'datetime_raw': 'header .schedule',
        'title': 'div.title',
        'img': 'div.cover@data-bg',
        'host': 'div.subtitle',
        'sections': [
          osmosis.find('.container-cards-replays > .d-inline-block')
          .set({
            'datetime_raw': '.content .time',
            'title': '.content .title',
            'presenter': '.content .subtitle',
            'img': 'picture img.picture@data-src'
          })
          .do(
            osmosis.follow('@href')
              .set({
                'description': '.header .description',
                'img_alt': '.header picture img@data-src'
              })
          )
        ]
      })
      .do(
        osmosis.follow('header > a@href')
          .set({
            'description': '.read-more-container'
          })
      )
      .data(function (listing) {
        listing.dateObj = dateObj
        scrapedData[name].push(listing);
      })
      .done(function () {
        resolve(true);
      })
  });
};

const fetchAll = (url, name, dateObj) => {
  scrapedData[name] = [];

  /* radio schedule page has the format 3am -> 3am,
     so we get the previous day as well to get the full day and the filter the list later  */
  const previousDay = moment(dateObj);
  previousDay.subtract(1, 'days');

  return fetch(url, name, previousDay)
    .then(() => {
      return fetch(url, name, dateObj);
    });
};

const getScrap = (url, name, dateObj, cutOffHour) => {
  return fetchAll(url, name, dateObj)
    .then(() => {
      return format(dateObj, name, cutOffHour);
    });
};

const scrapModuleAbstract = {
  getScrap,
  supportTomorrow: true,
};

module.exports = scrapModuleAbstract;
