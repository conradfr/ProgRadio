const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');

let scrapedData = {};

const dayFr = {
  'lundi': 1,
  'mardi': 2,
  'mercredi': 3,
  'jeudi': 4,
  'vendredi': 5,
  'samedi': 6,
  'dimanche': 7
};

const format = (dateObj, name) => {
  const mains = [];
  dateObj.locale('fr');

  scrapedData[name].forEach(function (entry) {
    let matched = false;
    let match_time = null;

    let regexp = new RegExp(/^Du\s(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\sau\s(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)/);
    let match = entry.datetime_raw.match(regexp);

    if (match !== null) {
      if (dateObj.isoWeekday() >= dayFr[match[1]] && dateObj.isoWeekday() <= dayFr[match[2]]) {
        matched = true;
      }
    }

    /*        if (matched === false) {
                regexp = new RegExp(/^Toute la semaine/);
                match = entry.datetime_raw.match(regexp);

                if (match !== null) {
                    matched = true;
                }
            }*/

    if (matched === false) {
      regexp = new RegExp(/^Le week-end/);
      match = entry.datetime_raw.match(regexp);

      if (match !== null && [6, 7].indexOf(dateObj.isoWeekday()) > -1) {
        matched = true;
      } else {
        regexp = new RegExp(/^(Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi|Dimanche)/);
        match = entry.datetime_raw.match(regexp);

        if (match !== null && dateObj.isoWeekday() === dayFr[match[1].toLowerCase()]) {
          matched = true;
        }
      }
    }

    if (matched === true) {
      regexp = new RegExp(/([0-9]{1,2})[h|H]([0-9]{2}) - ([0-9]{1,2})[h|H]([0-9]{2})/);
      match_time = entry.datetime_raw.match(regexp);
    } else {
      return;
    }

    let startDateTime = moment(entry.dateObj);
    startDateTime.hour(match_time[1]);
    startDateTime.minute(match_time[2]);
    startDateTime.second(0);

    endDateTime = moment(entry.dateObj);
    endDateTime.hour(match_time[3]);
    endDateTime.minute(match_time[4]);
    endDateTime.second(0);

    // midnight etc
    if (startDateTime.hour() > endDateTime.hour() || (endDateTime.hour() === 0 && endDateTime.minute() === 0)) {
      endDateTime.add(1, 'days');
    }

    // entry.description = entry.description.join(' ');

    delete entry.datetime_raw;
    entry.date_time_start = startDateTime.toISOString();
    entry.date_time_end = endDateTime.toISOString();

    mains.push(entry);
  });

  return Promise.resolve(mains);
};

const fetch = (url, name, dateObj) => {
  logger.log('info', `fetching ${url}`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .find(`.strict-block > .blog-style-square > .status-publish`)
      // .select('.item')
      .set({
        'img': '.item-header > .item-photo > img@src'
      })
      .set({
        'title': '.item-content > h3 > a',
        'datetime_raw': '.item-content > .item-icons',
        'description': '.item-content > p'
      })
      /*            .do(
                      osmosis.follow('.item-content > a@href')
                          .find('div.status-publish')
                          .set({
                              'description':  ['p']
                          })
                  )*/
      .data(function (listing) {
        scrapedData[name].push(listing);
      })
      .done(function () {
        resolve(true);
      })
  });
};

const fetchAll = (url, name, dateObj) => {
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
  supportTomorrow: false,
};

module.exports = scrapModuleAbstract;
