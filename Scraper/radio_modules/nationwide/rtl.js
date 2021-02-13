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
      if (date.tz('Europe/Paris').format('DD') !== dayStr) {
        return prev;
      }

      const newEntry = {
        date_time_start: date.toISOString(),
        title: element.title
      }

      // temp has there is a ssl error on the server on img import for rtl
      if (element.img !== undefined && element.img !== null) {
        if (element.img.startsWith('https')) {
          newEntry.img = 'http' + element.img.substr(4);
        } else {
          newEntry.img = element.img;
        }
      }

      let description = '';
      if (element.description2 !== undefined && element.description2 !== null) {
        description = element.description2.replace(/\n/g, '').replace(/\s+/g, ' ').trim() + '. ';
      }

      // description3 is often the same as description but not truncated, so used in priority
      if (element.description3 !== undefined && element.description3 !== null) {
        description += element.description3.trim();
      } else if (element.description !== undefined && element.description !== null) {
        description += element.description.trim();
      }

      newEntry.description = description.trim();

      const isMain = element['class'].indexOf('main') >= 0;

      if (isMain) {
        newEntry.host = element.host;

        main = newEntry;
      } else {
        newEntry.presenter = element.host;

        sections.push(newEntry);
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

      // temp has there is a ssl error on the server on img import for rtl
      if (main.img !== undefined && main.img !== null) {
        main.img = 'http' + main.img.substr(5);
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
              'description': '.infos > .text.desc',
              'description2': '.infos > .text.small'
            })
            .do(
              osmosis.follow('@href')
                .set({
                  'description3': '.cover-head-cell p.text',
                })
            )
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
