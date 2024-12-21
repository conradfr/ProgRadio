const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');

let scrapedData = [];

const dayNameFr = [
  'Lundi:',
  'Mardi:',
  'Mercredi:',
  'Jeudi:',
  'Vendredi:',
  'Samedi:',
  'Dimanche:'
];

const format = dateObj => {
  dateObj.tz('Europe/Paris');
  dateObj.locale('fr');

  const cleanedData = scrapedData.reduce((prev, entry) => {
    const dayNum = dateObj.weekday();
    const dayIndex = entry.day_raw.indexOf(dayNameFr[dayNum]);

    if (dayIndex === -1 || entry.time_raw[dayIndex] === 'fermé') {
      return prev;
    }

    const regexp = /([0-9]{1,2}):([0-9]{1,2})-([0-9]{1,2}):([0-9]{1,2})/;
    const match = entry.time_raw[dayIndex].match(regexp);

    if (match === null) {
      return prev;
    }

    const startDateTime = moment(dateObj);
    startDateTime.hour(match[1]);
    startDateTime.minute(match[2]);
    startDateTime.second(0);

    const endDateTime = moment(dateObj);
    endDateTime.hour(match[3]);
    endDateTime.minute(match[4]);
    endDateTime.second(0);

    const newEntry = {
      date_time_start: startDateTime.toISOString(),
      date_time_end: endDateTime.toISOString(),
      host: entry.host || null,
      title: entry.title || null,
      img: entry.img ? `https://www.bretagne5.fr${entry.img}` : null,
      description: entry.description || null
    };

    prev.push(newEntry);
    return prev;
  }, []);

  return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
  const day = dateObj.format('YYYY-MM-DD');
  const url = `https://www.bretagne5.fr/grille-des-programmes?date=${day}`;

  logger.log('info', `fetching ${url}`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .find('.list-programs .program_item')
      // .select('.item')
      .set({
        'img': '.media--image img@data-src',
        'day_raw': ['.office-hours__item-label'],
        'time_raw': ['.office-hours__item-slots'],
        'title': '.col_3_program h3',
        'host': '.author_content span'
      })
      .do(
        osmosis.follow('a.ajax-link@href:first')
          .set({
            'description': '.banner_padding p.description'
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
  getName: 'bretagne5',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
