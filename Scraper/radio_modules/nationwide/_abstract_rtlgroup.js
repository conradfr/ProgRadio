const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');
const srcset = require('srcset');
const orderBy = require("lodash.orderby");

const scrapedData = {};
const cleanedData = {};
// let referenceIndex = 0;

const format = (dateObj, name, cutOffHour) => {
  // we use reduce instead of map to act as a map+filter in one pass
  cleanedData[name] = scrapedData[name].reduce(function (prev, curr, index, array) {
    if (!curr.datetime_raw && !curr.datetime_raw_alt) {
      return prev;
    }

    // live show at the time of scraping as different markup
    if (!curr.datetime_raw) {
      curr.datetime_raw = curr.datetime_raw_alt;
    }

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

    if (curr.img !== undefined && curr.img !== null && curr.img.trim() !== '') {
      const images = srcset.parse(curr.img);
      if (images.length > 0) {
        const imagesSorted = orderBy(images, ['width'], ['desc']);
        newEntry.img = imagesSorted[0].url;
      }
    }

    // temp has there is a ssl error on the server on img import for rtl
    // if (curr.img !== undefined && curr.img !== null) {
    //   if (curr.img.startsWith('https')) {
    //     newEntry.img = 'http' + curr.img.substr(5);
    //   } else {
    //     newEntry.img = curr.img;
    //   }
    // }

    // sections

    if (curr.sections !== undefined && curr.sections !== null
      && (curr.sections.length > 1 || (curr.sections.length > 0 && typeof curr.sections[0] !== 'string'))) {

      newEntry.sections = [];

      curr.sections.forEach(function (section) {
          // weird edge case
          if (typeof section === 'string') {
            return;
          }

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
              newSection.description = typeof section.description === 'Array' ? section.description[0].trim() : section.description[0].trim();
            }

            if (section.img !== undefined && section.img !== null && section.img.trim() !== '') {
              const images = srcset.parse(section.img);
              if (images.length > 0) {
                const imagesSorted = orderBy(images, ['width'], ['desc']);
                newSection.img = imagesSorted[0].url;
              }
            } else if (section.img_alt !== undefined && section.img_alt !== null && section.img_alt.trim() !== '') {
              const images = srcset.parse(section.img_alt);
              if (images.length > 0) {
                const imagesSorted = orderBy(images, ['width'], ['desc']);
                newSection.img = imagesSorted[0].url;
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
      .find('.container .programme-card')
      .set({
        'datetime_raw': '.programme-card__time',
        'datetime_raw_alt': '.programme-card__live-time',
        'title': '.programme-card__title',
        'img': 'picture source@data-srcset',
        'host': '.programme-card__hosts',
        'sections': [
          osmosis.find('.programme-card__chroniques-list .programme-card__chronique')
          .set({
            'datetime_raw': '.programme-card__chronique-time',
            'title': '.programme-card__chronique-title',
            'presenter': '.programme-card__chronique-hosts',
            'img': '.programme-card__chronique-cover picture source@data-srcset'
          })
          .do(
            osmosis.follow('@href')
              .set({
                'description': '.read-more-container p.description',
                'img_alt': '.cover picture source@data-srcset'
              })
          )
        ]
      })
      .do(
        osmosis.follow('.programme-card__body > a@href')
          .set({
            'description': '.read-more-container .description'
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
