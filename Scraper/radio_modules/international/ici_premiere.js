let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');
const axios = require('axios');
const { convert } = require('html-to-text');

let scrapedData = [];

const format = async dateObj => {
  const startDateTime = moment(dateObj);
  startDateTime.hour(0);
  startDateTime.minute(0);
  startDateTime.second(0);
  startDateTime.millisecond(0);

  const endDateTime = moment(dateObj);
  endDateTime.hour(23);
  endDateTime.minute(59);
  endDateTime.second(59);
  endDateTime.millisecond(0);

  // we use reduce instead of map to act as a map+filter in one pass
  const cleanedData = await scrapedData.reduce(async function (prev, curr) {
    return prev.then(async (items) => {
      const currStartDateTime = moment(curr.startsAt);

      if (currStartDateTime.isBetween(startDateTime, endDateTime, 'seconds', '[]') === false) {
        return items;
      }

      currEndDateTime = moment(curr.endsAt);

      newEntry = {
        'date_time_start': currStartDateTime.toISOString(),
        'date_time_end': currEndDateTime.toISOString(),
        'title': curr.title,
        'host': curr.summary,
        'img': curr.picture && curr.picture.url.replace('{0}', '180').replace('{1}', '1x1')
      };

      // seems to have moved to a json based variable in a script, let's ignore for now
/*      await osmosis
        .get(`https://ici.radio-canada.ca/ohdio${curr.url}`)
        .find('.section-main .about-content')
        .set({
          'description':  ['p'],
        })
        .data(function(listing) {
          console.log(listing);
          newEntry.description = listing.description.join(' ');
        });*/

      await items.push(newEntry);
      return items;
    });
  }, Promise.resolve([]));

  return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
  dateObj.locale('fr');
  const format = 'YYYY-MM-DD';

  const url = `https://services.radio-canada.ca/neuro/sphere/v1/audio/apps/radios/premiere/schedule/${dateObj.format(format)}?context=web&regionId=8`;

  logger.log('info', `fetching ${url}`);

  return axios.get(url)
    .then(function (response) {
      scrapedData = [...scrapedData, ...response.data.broadcasts];
      // return resolve(true);
    })/*.catch((error) => logger.ilog('warn', error))*/;
};

const fetchAll = dateObj => {
  const previousDay = moment(dateObj);
  previousDay.subtract(1, 'days');

  return fetch(previousDay)
    .then(() => {
      return fetch(dateObj);
    }).catch(() => fetch(dateObj));
};

const getScrap = dateObj => {
  return fetchAll(dateObj)
    .then(() => {
      return format(dateObj);
    }).catch(() => format(dateObj));
};

const scrapModule = {
  getName: 'ici_premiere',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
