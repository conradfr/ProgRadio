const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');

let scrapedData = {};

const format = (dateObj, name) => {
  const mains = [];
  dateObj.locale('fr');

  scrapedData[name].forEach(function (entry) {
    let regexp = new RegExp(/([0-9]{1,2})[-]([0-9]{1,2})h/);
    let match = entry.raw.match(regexp);
    let endDate = true;

    if (match === null) {
      regexp = new RegExp(/([0-9]{1,2})h/);
      match = entry.raw.match(regexp);
      endDate = false;
    }

    if (match === null) {
      return;
    }

    let startDateTime = moment(dateObj);
    startDateTime.hour(match[1]);
    startDateTime.minute(0);
    startDateTime.second(0);

    if (endDate) {
      endDateTime = moment(dateObj);
      endDateTime.hour(match[2]);
      endDateTime.minute(0);
      endDateTime.second(0);

      // midnight etc
      if (startDateTime.hour() > endDateTime.hour() || (endDateTime.hour() === 0 && endDateTime.minute() === 0)) {
        endDateTime.add(1, 'days');
      }
    }

    const newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'title': entry.raw
    };

    if (endDate) {
      newEntry.date_time_end = endDateTime.toISOString();
    }

    const titleStartAt = entry.raw.indexOf(' ');

    if (titleStartAt !== -1) {
      newEntry.title = entry.raw.substring(titleStartAt + 1);
    }

    mains.push(newEntry);
  });

  return Promise.resolve(mains);
};

const fetch = (flux, dateObj) => {
  const url = `https://www.pulsradio.com/grille_content.php?day=${dateObj.isoWeekday()}&flux=${flux}`
  logger.log('info', `fetching ${url}`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .find(`li`)
      .set({
        'raw': '.',
      })
      .data(function (listing) {
        scrapedData[flux].push(listing);
      })
      .done(function () {
        resolve(true);
      })
  });
};

const fetchAll = (flux, dateObj) => {
  return fetch(flux, dateObj);
};

const getScrap = (dateObj, flux) => {
  scrapedData[flux] = [];
  return fetchAll(flux, dateObj)
    .then(() => {
      return format(dateObj, flux);
    });
};

const scrapModuleAbstract = {
  getScrap,
  supportTomorrow: true,
};

module.exports = scrapModuleAbstract;
