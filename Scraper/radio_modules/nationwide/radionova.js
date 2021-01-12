const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');

let scrapedData = [];

const format = dateObj => {
  // we use reduce instead of map to act as a map+filter in one pass
  const cleanedData = scrapedData.reduce(function (prev, curr) {
    if (typeof curr.days === 'undefined') {
      return prev;
    }

    if (typeof curr.time === 'undefined') {
      return prev;
    }

    const daysArray = eval(curr.days);

    if (daysArray.indexOf(dateObj.day().toString()) === -1) {
      return prev;
    }

    // TIME

    let regexp = new RegExp(/([0-9]{1,2}):([0-9]{0,2})/);
    let match = curr.time.match(regexp);

    // should not happen
    if (match === null) {
      return prev;
    }

    const startDateTime = moment(dateObj);
    startDateTime.hour(match[1]);
    if (match[2].length > 0) {
      startDateTime.minute(match[2]);
    } else {
      startDateTime.minute(0);
    }
    startDateTime.second(0);

    // Export

    const newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'title': curr.title
    }

    if (curr.img !== undefined) {
      if ( curr.img.indexOf('?') !== -1) {
        newEntry.img = curr.img.split('?')[0];
      } else {
        newEntry.img = curr.img;
      }
    }

    if (curr.host !== undefined) {
      newEntry.host = curr.host;
    }

    if (curr.description !== undefined && curr.description.length > 0) {
      newEntry.description = curr.description.join("\n").trim();
    } else if (curr.description_alt !== undefined) {
      newEntry.description = curr.description_alt.replace(/\u00a0/g, ' ').replace(/(<([^>]+)>)/gi, "");
    }

    prev.push(newEntry);
    return prev;
  }, []);

  return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
  dateObj.locale('fr');
  const url = 'https://www.nova.fr/la-grille-nova/la-grille/';

  logger.log('info', `fetching ${url}`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .select('.program-item')
      .set({
        'days': '@data-days',
        'img': '.img_grille img@src',
        'time': '.infos_grille > .date',
        'title': '.infos_grille > h2',
        'host': '.presenter p',
        'description': ['.content p'],
        'description_alt': '.content'
      })
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
  getName: 'radionova',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
