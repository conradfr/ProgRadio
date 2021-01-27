const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');

let scrapedData = [];

const dayAbr = {
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
  7: 'Sun'
};

const format = dateObj => {
  dateObj.tz("Europe/Paris");
  dateObj.locale('fr');

  const cleanedData = scrapedData.reduce(function (prev, entry) {
    const regexp = new RegExp(/([0-9]{1,2})[h|H] > ([0-9]{1,2})[h|H]/);
    let match = entry.datetime_raw.match(regexp);

    if (match === null) {
      return prev;
    }

    // duplicated for now on the page
    if (match[2] === '24') {
      return prev;
    }

    let startDateTime = moment(dateObj);
    const startHour = match[1] === '24' ? 0 : match[1];
    startDateTime.hour(startHour);
    startDateTime.minute(0);
    startDateTime.second(0);

    endDateTime = moment(dateObj);
    const endHour = match[2] === '24' ? 0 : match[2];
    endDateTime.hour(endHour);
    endDateTime.minute(0);
    endDateTime.second(0);

    // midnight
    if (endDateTime.hour() === 0) {
      endDateTime.add(1, 'days');
    }

    const startImgStr = entry.img.indexOf('image=') + 6;
    const imgStrLength = entry.img.indexOf('&') - startImgStr;
    const img = 'https://www.topmusic.fr/' + entry.img.substr(startImgStr, imgStrLength);

    const newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString(),
      'img': img,
      'title': entry.title.substr(match[0].length).trim(),
      'description': entry.description.trim(),
    };

    prev.push(newEntry);
    return prev;
  }, []);

  return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
  const dayStr = dayAbr[dateObj.isoWeekday()];
  const url = `https://www.topmusic.fr/radio/?day=${dayStr}`;

  logger.log('info', `fetching ${url}`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .find(`section#sectionRadio > .content > .entry`)
      // .select('.item')
      .set({
        'img': 'img@src',
        'title': 'h2',
        'datetime_raw': 'h2 > span',
        'description': 'p'
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
  getName: 'topmusic',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
