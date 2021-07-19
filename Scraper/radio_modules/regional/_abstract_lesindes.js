const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');

let scrapedData = {};

const format = (dateObj, name, img_prefix) => {
  const mains = [];
  scrapedData[name].forEach(function (curr) {
    let regexp = new RegExp(/^(.*), de ([0-9]{1,2})[:]([0-9]{2})\sà\s([0-9]{1,2})[:]([0-9]{2})/);
    let match = curr.datetime_raw.match(regexp);

    // no time = exit, Toute la semaine = chroniques
    if (match === null || match[1] === 'Toute la semaine') {
      return;
    }

    const startDateTime = moment(dateObj);
    startDateTime.tz(dateObj.tz());
    const endDateTime = moment(dateObj);
    endDateTime.tz(dateObj.tz());

    startDateTime.hour(match[2]);
    startDateTime.minute(match[3]);
    startDateTime.second(0);
    endDateTime.hour(match[4]);
    endDateTime.minute(match[5]);
    endDateTime.second(0);

    // midnight etc
    if (startDateTime.hour() > endDateTime.hour() || (endDateTime.hour() === 0 && endDateTime.minute() === 0)) {
      endDateTime.add(1, 'days');
    }

    // chronique ?
    if (endDateTime.diff(startDateTime, 'minutes') < 5) {
      return;
    }

    // Deal with radios on another timezone and convert to Paris time
    // @todo improves tz handling across the whole app

    if (startDateTime.tz() !== 'Europe/Paris') {
      startDateTime.tz('Europe/Paris');
    }

    if (endDateTime.tz() !== 'Europe/Paris') {
      endDateTime.tz('Europe/Paris');
    }

    let description = curr.description.split('\r\n').join(' ').trim();

    if (description === undefined || description === null || description === '') {
      description = curr.description_alt.join(' ').trim();
    }

    if (description === '') {
      description = null;
    }

    const newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString(),
      'img': curr.img.substr(0, 4) !== 'http' ? `${img_prefix}${curr.img}` : curr.img,
      'title': curr.title,
      'description': description,
      'host': typeof curr.host === 'object' ? curr.host[1] : null
    };

    mains.push(newEntry);
  });

  return Promise.resolve(mains);
};

const fetch = (url, name, dateObj) => {
  dateObj.locale('fr');
  const todayObj = moment(dateObj);
  todayObj.tz('Europe/Paris');
  let day = todayObj.format('dddd').toLowerCase();

  logger.log('info', `fetching ${url}`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .find(`.row.${day}`)
      .set({
          'img': 'img@src',
          'datetime_raw': '.jours_diffusion',
          'title': 'h2, h3',
          'description': 'p'
        }
      )
      .do(
        osmosis.follow('.title a@href')
          .find('.content')
          .set({
            'description_alt': ['p'],
            'host': 'h4',
          })
      )
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

const getScrap = (dateObj, url, name, img_prefix) => {
  scrapedData[name] = [];
  return fetchAll(url, name, dateObj)
    .then(() => {
      return format(dateObj, name, img_prefix);
    });
};

const scrapModuleAbstract = {
  getScrap,
  supportTomorrow: true,
};

module.exports = scrapModuleAbstract;
