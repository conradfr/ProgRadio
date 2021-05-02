const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');

let scrapedData = [];

const format = dateObj => {
  // we use reduce instead of map to act as a map+filter in one pass
  const cleanedData = scrapedData.reduce(function (prev, curr) {
    // Time
    let regexp = new RegExp(/([0-9]{1,2})[h|H]([0-9]{2})\s{0,1}[—|-]\s{0,1}([0-9]{1,2})[h|H]([0-9]{0,2})/);
    let match = curr.datetime_raw.match(regexp);

    // no time, exit
    if (match === null) {
      return prev;
    }

    const startDateTime = moment(dateObj);
    const endDateTime = moment(dateObj);

    startDateTime.hour(match[1]);
    startDateTime.minute(match[2]);
    startDateTime.second(0);
    endDateTime.hour(match[3]);

    if (match[4] !== undefined && match[4] !== null) {
      endDateTime.minute(match[4]);
    } else {
      endDateTime.minute(0);
    }
    endDateTime.second(0);

    // midnight etc
    if (startDateTime.hour() > endDateTime.hour()) {
      endDateTime.add(1, 'days');
    }

    delete curr.datetime_raw;
    curr.date_time_start = startDateTime.toISOString();
    curr.date_time_end = endDateTime.toISOString();

    curr.title = curr.title.replace('  /', '');

    prev.push(curr);

    return prev;
  }, []);

  return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
  dateObj.locale('fr');
  let day = dateObj.format('dddd').toLowerCase();
  let url = `http://www.rfm.fr/programmes`;

  logger.log('info', `fetching ${url} (${day})`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .find(`#${day}`)
      .select('.row')
      .set({
        'img': 'img@src'
      })
      .select('.texte > .texte_cnt')
      .set({
        'datetime_raw': '.horaire',
        'title': 'a'
      })
      .do(
        osmosis.follow('a@href')
          .set({
            'description': '.chapo'
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
  return fetch(dateObj);
};

const getScrap = dateObj => {
  return fetchAll(dateObj)
    .then(() => {
      return format(dateObj);
    });
};

const scrapModule = {
  getName: 'rfm',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
