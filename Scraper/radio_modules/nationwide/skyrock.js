const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');
const axios = require("axios");

let scrapedData = [];
let referenceIndex = 0;

const format = dateObj => {

  // we use reduce instead of map to act as a map+filter in one pass
  const cleanedData = scrapedData.reduce(function (prev, curr, index, array) {
    const firstStartTimeToday = moment(dateObj).startOf('day');
    const endStartTimeToday = moment(dateObj).endOf('day');

    const startDateTime = moment(curr.starts_at, moment.ISO_8601, 'Europe/Paris');
    const endDateTime = moment(curr.ends_at, moment.ISO_8601, 'Europe/Paris');

    if (startDateTime.isBefore(firstStartTimeToday)) {
      return prev;
    }

    if (startDateTime.isAfter(endStartTimeToday)) {
      return prev;
    }

    const host = curr.radio_hosts.map((h) => h.name).join(', ') || null;

    newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString(),
      'title': curr.radio_emission_title,
      'description': curr.radio_emission_description,
      'img': curr.emission_cover_url,
      'host': host

    };

    prev.push(newEntry);
    return prev;
  }, []);

  return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
  dateObj.locale('fr');

  const day = dateObj.format('YYYY-MM-DD');
  const url = `https://skyrock.fm/api/2020/radio/skyrock/emissions_grid/${day}`;

  logger.log('info', `fetching ${url}`);

  return axios.get(url)
      .then(function (response) {
        scrapedData = [...scrapedData, ...response.data.scheduled_emissions];
        // return resolve(true);
      })/*.catch((error) => logger.ilog('warn', error))*/;
};

const fetchAll = dateObj => {
  /* radio schedule page has the format 3am -> 3am,
     so we get the previous day as well to get the full day and the filter the list later  */
  const previousDay = moment(dateObj);
  previousDay.subtract(1, 'days');

  return fetch(previousDay)
    .then(() => {
      return fetch(dateObj);
    });
};

const getScrap = dateObj => {
  return fetchAll(dateObj)
    .then(() => {
      return format(dateObj);
    });
};

const scrapModule = {
  getName: 'skyrock',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
