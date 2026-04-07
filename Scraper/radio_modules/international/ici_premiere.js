const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');
const axios = require('axios');

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
      const currStartDateTime = moment(curr.startTime);

      if (currStartDateTime.isBetween(startDateTime, endDateTime, 'seconds', '[]') === false) {
        return items;
      }

      currEndDateTime = moment(curr.endTime);

      const newEntry = {
        'date_time_start': currStartDateTime.toISOString(),
        'date_time_end': currEndDateTime.toISOString(),
        'title': curr.title,
        'host': curr.hosts,
        'img': curr.picture && curr.picture.pattern.replace('{width}', '180').replace('{ratio}', '1x1')
      };

      // seems to have moved to a json based variable in a script, let's ignore for now
      try {
        await osmosis
          .get(`https://ici.radio-canada.ca/ohdio${curr.url}`)
          .find('#sommaire')
          .set({
            'description':  ['p'],
          })
          .data(function(listing) {
            newEntry.description = listing.description.join(' ');
          });
        } catch (error) {
          // nothing
        }

      await items.push(newEntry);
      return items;
    });
  }, Promise.resolve([]));

  return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
  dateObj.locale('fr');
  const format = 'YYYY-MM-DD';

  const url = `https://services.radio-canada.ca/bff/audio/graphql?opname=broadcastSchedule&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%229c91936aea5a25108578e5887fb1a377575d38d55fb30448208bf858e10024b3%22%7D%7D&variables=%7B%22params%22%3A%7B%22broadcastingNetworkId%22%3A3%2C%22device%22%3A%22Web%22%2C%22date%22%3A%22${dateObj.format(format)}%22%2C%22liveSchedule%22%3Afalse%2C%22regionId%22%3A8%7D%7D`;

  logger.log('info', `fetching ${url}`);

  return axios.get(url, {
    headers: {
      'content-type': 'application/json',
      'apollo-require-preflight': 1,
      'Host': 'services.radio-canada.ca'
    }
  })
    .then(function (response) {
      scrapedData = [...scrapedData, ...response.data.data.broadcastSchedule.broadcasts];
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
