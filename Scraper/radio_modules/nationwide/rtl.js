const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');

let scrapedData = [];

const format = dateObj => {
  const dayStr = dateObj.format('DD');

  // we use reduce instead of map to act as a map+filter in one pass
  const cleanedData = scrapedData.reduce(function (prev, curr) {
    let main = null;
    const sections = [];

    curr.forEach(function (element) {
      const date = moment(parseInt(element['datetime_raw']));

      // filter other days
      if (date.tz('Europe/Paris').format('DD') === dayStr) {
        delete element.datetime_raw;
        const isMain = element['class'].indexOf('main') >= 0;
        delete element['class'];

        if (isMain) {
          element.date_time_start = date.toISOString();

          main = element;
        } else {
          element.date_time_start = date.toISOString();

          element.presenter = element.host;
          delete element.host;

          sections.push(element);
        }
      }
    });

    if (main !== null) {
      main.sections = sections;

      // Since 13/12/2019 some shows are duplicated and if sections the first one do not have them.
      // So we delete the first one if datetime & title are identical
      // Will need to be monitored

      if (prev.length > 0) {
        const row_id = prev.length - 1;
        prev_datetime = prev[row_id].date_time_start;
        prev_title = prev[row_id].title;

        if (prev_datetime === main.date_time_start && prev_title === main.title) {
          prev.pop();
        }
      }

      prev.push(main);
    }

    return prev;
  }, []);

  return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
  let dayFormat = dateObj.format('DD-MM-YYYY');
  let url = `https://www.rtl.fr/grille/${dayFormat}`;

  logger.log('info', `fetching ${url}`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      // .find('.timeline-schedule > .post-schedule-timeline > .post-schedule')
      .find('.timeline-schedule > .post-schedule-timeline')
      .set(
        [
          osmosis.find('.post-schedule')
            .set({
              'class': '@class',
              'datetime_raw': 'time@datetime' /* utc */
            })
            .select('.mdl-bvl')
            .set({
              'title': '.infos > h2.title',
              'img': 'img@data-src',
              'host': '.infos > p[1] > b',
              'description': '.infos > .text.desc'
            })
        ]
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
  getName: 'rtl',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
