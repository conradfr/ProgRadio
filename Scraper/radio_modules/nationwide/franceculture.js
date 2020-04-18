const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');

let scrapedData = [];

const format = dateObj => {
  const dayStr = dateObj.format('DD');

  const mains = [];
  const sections = [];

  scrapedData.forEach(function (curr) {
    const dateStart = moment.unix(parseInt(curr['date_time_start_raw']));

    // filter other days
    if (dateStart.tz('Europe/Paris').format('DD') !== dayStr) {
      return;
    }

    delete curr.date_time_start_raw;

    // filtering weird base64 for now
    if (typeof curr.img !== 'undefined' && curr.img.substring(0, 3) !== 'http') {
      delete curr.img;
    }

    curr.date_time_start = dateStart.toISOString();

    let main = true;
    if (typeof curr.title_main !== 'undefined') {
      curr.sections = [];
      curr.title = curr.title_main;
      delete curr.title_main;

      const dateEnd = moment.unix(parseInt(curr['date_time_end_raw']));
      curr.date_time_end = dateEnd.toISOString();
    } else {
      main = false;
      curr.title = curr.title_section;
      delete curr.title_section;
    }

    delete curr.date_time_end_raw;

    if (main === true) {
      mains.push(curr);
    } else {
      sections.push(curr);
    }
  });

  if (sections.length > 0) {
    // sort mains
    function compare(a, b) {
      momentA = moment(a.date_time_start);
      momentB = moment(b.date_time_start);

      if (momentA.isBefore(momentB))
        return -1;
      if (momentA.isAfter(momentB))
        return 1;
      return 0;
    }

    mains.sort(compare);

    sections.forEach(function (entry) {
      for (i = 0; i < mains.length; i++) {
        entryMoment = moment(entry.date_time_start);
        mainMoment = moment(mains[i].date_time_start);

        let toAdd = false;
        if (i === (mains.length - 1)) {
          if (entryMoment.isAfter(mainMoment)) {
            toAdd = true;
          }
        } else if (entryMoment.isBetween(mainMoment, moment(mains[i + 1].date_time_start))) {
          toAdd = true;
        }

        if (toAdd === true) {
          mains[i].sections.push(entry);
          break;
        }
      }
    });
  }

  return Promise.resolve(mains);
};

const fetch = dateObj => {
  const dayFormat = dateObj.format('YYYY-MM-DD');
  const url = `https://www.franceculture.fr/programmes/${dayFormat}/`;

  logger.log('info', `fetching ${url}`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .find('.program-item')
      .set({
        'date_time_start_raw': '@data-start-time', /* utc */
        'date_time_end_raw': '@data-end-time'
      })
      .set({
        'title_main': '.level1 .program-item-content-elements-title',
        'title_section': '.level2 .program-item-content-elements-title',
      })
      .do(
        osmosis.follow('a.program-item-content-elements-infos@href')
          .set({
            'description': '.intro > p'
          })
      )
      .data(function (listing) {
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
  getName: 'franceculture',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
