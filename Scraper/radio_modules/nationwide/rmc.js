const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');
const orderBy = require('lodash.orderby');
const srcset = require('srcset');

let scrapedData = [];
let scrapedShows = {};
let dayNumber = null;
let referenceIndex = 0;

const format = dateObj => {
  dateObj.tz("Europe/Paris");
  dateObj.locale('fr');
  // we use reduce instead of map to act as a map+filter in one pass
  const cleanedData = scrapedData.reduce(function (prev, curr, index, array) {
    let startDateTime = moment(curr.dateObj);

    regexp = new RegExp(/([0-9]{1,2}):([0-9]{2})/);
    match_time = curr.time.match(regexp);

    if (match_time !== null) {
      startDateTime.hour(match_time[1]);
      startDateTime.minute(match_time[2]);
      startDateTime.second(0);
    } else {
      return prev;
    }

    let prevMatch = null;
    // keep only relevant time from previous day page
    if (startDateTime.isBefore(dateObj, 'day')) {
      if (index === 0) {
        return prev;
      }

      prevMatch = array[0].time.match(regexp);
      array[0].dateObj.hour(prevMatch[1]);

      if (array[0].dateObj.isBefore(startDateTime)) {
        return prev;
      }

      // update day
      startDateTime.add(1, 'days');
      // endDateTime.add(1, 'days');
    }
    // remove next day schedule from day page
    else {
      if (curr.dateObj !== array[index - 1].dateObj) {
        referenceIndex = index;
      } else {
        prevMatch = array[referenceIndex].time.match(regexp);
        let prevDate = moment(array[referenceIndex].dateObj);
        prevDate.hour(prevMatch[1]);

        if (prevDate.isAfter(startDateTime)) {
          return prev;
        }
      }

      // if (startDateTime.hour() > endDateTime.hour()) {
      //   endDateTime.add(1, 'days');
      // }
    }

    newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'title': curr.title
    };

    if (curr.img !== undefined && curr.img !== null && curr.img.trim() !== '') {
      const images = srcset.parse(curr.img);
      if (images.length > 0) {
        imagesSorted = orderBy(images, ['width'], ['desc']);
        newEntry.img = imagesSorted[0].url;
      }
    }

    // host  ?
    if (scrapedShows[curr.title.toLowerCase()] !== undefined && scrapedShows[curr.title.toLowerCase()].host !== undefined
      && scrapedShows[curr.title.toLowerCase()].host !== null && scrapedShows[curr.title.toLowerCase()].host !== '') {
      newEntry.host = scrapedShows[curr.title.toLowerCase()].host;
    }

    // description ?
    if (scrapedShows[curr.title.toLowerCase()] !== undefined && scrapedShows[curr.title.toLowerCase()].description !== undefined
      && scrapedShows[curr.title.toLowerCase()].description !== null && scrapedShows[curr.title.toLowerCase()].description !== '') {
      newEntry.description = scrapedShows[curr.title.toLowerCase()].description;
    }

    prev.push(newEntry);
    return prev;
  }, []);

  return Promise.resolve(cleanedData);
};

// to get hosts (they're not on the schedule page)
const fetchShows = () => {
  const url = 'https://rmc.bfmtv.com/emission/';

  logger.log('info', `fetching ${url} (shows)`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .find('.replay_wrapper')
      .select('.replay_item')
      .do(
        osmosis
          .follow('a:first@href')
          .find('.emissions_content')
          .set({
            'title': '.emissions_title',
            'datetime_raw': 'time',
            'host': '.emissions_presenter span',
            'description': ".emissions_description_text"
          })
      )
      .data(function (listing) {
        if (listing.title !== undefined) {
          scrapedShows[listing.title.toLowerCase()] = listing;
        }
      })
      .done(function () {
        resolve(true);
      })
  });
};

const find_day_nb = dateObj => {
  dateObj.locale('fr');
  const url = 'https://rmc.bfmtv.com/grille-radio/';

  const day = dateObj.format('dddd').toLowerCase();
  let number = 0;

  // logger.log('info', `fetching ${url}`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .select('.grille_days > li')
      .set({
        'day': '.day_title'
      })
      .data(function (listing) {
        if (listing.day === day) {
          dayNumber = number;
        }
        number++;
      })
      .done(function () {
        if (dayNumber !== null) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
  });
};

const fetch = async dateObj => {
  dateObj.locale('fr');

  await find_day_nb(dateObj);

  if (dayNumber === null) {
    return null;
  }

  const url = 'https://rmc.bfmtv.com/grille-radio/';

  logger.log('info', `fetching ${url}`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .find(`.grille_programmes:range(${dayNumber + 1}, ${dayNumber + 1})`)
      .select('.grille_hours_content')
      .set({
        'time': '.grille_date',
        'img': '.grille_picture img@srcset',
        'img_alt': '.grille_picture img@src',
        'title': '.grille_content .grille_title'
      })
      .data(function (listing) {
        listing.dateObj = dateObj;
        scrapedData.push(listing);
      })
      .done(function () {
        resolve(true);
      });
  });
};


const fetchAll = dateObj => {
  const previousDay = moment(dateObj);
  previousDay.subtract(1, 'days');

  return fetch(previousDay)
    .then(() => {
      return fetch(dateObj);
    }).catch(() => fetch(dateObj));
};

const getScrap = dateObj => {
  return fetchShows()
    .then(() => {
      return fetchAll(dateObj)
        .then(() => {
          return format(dateObj);
        })
    });
};

const scrapModule = {
  getName: 'rmc',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
