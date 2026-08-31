const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');

let scrapedData = {};
let referenceIndex = 0;
let cleanedData = {};

const format = (dateObj, name) => {

  // we use reduce instead of map to act as a map+filter in one pass
  cleanedData[name] = scrapedData[name].reduce(function (prev, curr, index, array) {
    let regexp = new RegExp(/^([0-9]{1,2})[:]([0-9]{2})/);
    let match = curr.datetime_raw.match(regexp);

    // no time = exit
    if (match === null) {
      return prev;
    }

    const startDateTime = moment(curr.dateObj);
    startDateTime.tz(dateObj.tz());

    startDateTime.hour(match[1]);
    startDateTime.minute(match[2]);
    startDateTime.second(0);

    let description = '';

    if (curr.sections.length > 0) {
      description += curr.sections.join(' / ');
      description += '. ';
    }

    if (curr.description !== undefined) {
      description += curr.description.replace(/\s\s+/g, ' ');
    }

    const newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'img': curr.img,
      'title': curr.title && curr.title !== '' ? curr.title : 'Programme inconnu',
      'description': description && description !== '' ? description : null
    };

    if (curr.host && curr.host !== '') {
      newEntry.host = curr.host;
    }

    prev.push(newEntry);
    return prev;
  }, []);

  return Promise.resolve(cleanedData[name]);
};

const fetch = (url, name, dateObj) => {
  const seen = new Set();
  const day = dateObj.format('YYYY-MM-DD');
  const day_url = `${url}?date=${day}`;

  logger.log('info', `fetching ${day_url}`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(day_url)
      .select('.rts-modules-programme-list article.programme-item')
      .set({
          'img': 'img.photo@src',
          'datetime_raw': 'span.time',
          'title': 'h2',
          'host': 'p.animators',
          'sections': ['.sequences__list li']
        }
      )
      .do(
        osmosis
          .follow('a:first@href')
          .set({
            'description': "meta[name='description']@content"
          })
      )
      .data(function (listing) {
        if (listing.datetime_raw === undefined) {
          return;
        }

        // osmosis emits one event per `sections` element when combined with
        // a .follow() sub-request — dedupe identical articles here.
        const key = `${listing.datetime_raw}|${listing.title}`;
        if (seen.has(key)) {
          return;
        }
        seen.add(key);

        listing.dateObj = dateObj;
        scrapedData[name].push(listing);
      })
      .done(function () {
        resolve(true);
      })
  });
};

const fetchAll = (url, name, dateObj) => {
  dateObj.locale('fr');
  dateObj.tz('Europe/Zurich');

  return fetch(url, name, dateObj);
};

const getScrap = (dateObj, url, name) => {
  scrapedData[name] = [];
  return fetchAll(url, name, dateObj)
    .then(() => {
      return format(dateObj, name);
    });
};

const scrapModuleAbstract = {
  getScrap,
  supportTomorrow: true,
};

module.exports = scrapModuleAbstract;
