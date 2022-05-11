let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');
const axios = require('axios');
const node_fetch = require('node-fetch');

let scrapedData = [];

const fetchSections = async (id) => {
  const response = await node_fetch(`https://www.radiofrance.fr/api/v1.7/stations/franceinter/programs/${id}/chronicles`);
  return await response.json();
};

const format = async dateObj => {
  const dayStr = dateObj.format('DD');
  const datetimeStored = [];

  // we use reduce instead of map to act as a map+filter in one pass
  const cleanedData = scrapedData.reduce(async function (prevP, curr, index, array) {
    const prev = await prevP;
    const date = moment.unix(curr.startTime);

    // as we have to analyze two pages and can get results from previous and next days ...
    // 1. filter other days
    if (date.tz('Europe/Paris').format('DD') !== dayStr) {
      return prev;
    }
    // 2. filter duplicated shows
    if (datetimeStored.indexOf(curr['datetime_raw']) > -1) {
      return prev;
    }

    const newEntry = {
      'date_time_start': date.toISOString(),
      'date_time_end': moment.unix(curr.endTime).toISOString(),
      'title': curr.concept.title,
      'description': curr.expression.title !== undefined ? curr.expression.title : null,
      'host': curr.concept.producers !== undefined ? curr.concept.producers : null,
      'img': curr.concept.visual.src !== undefined ? curr.concept.visual.src : null,
      'sections': []
    };

    datetimeStored.push(moment.unix(curr.startTime));

    const sections = await fetchSections(curr.id);

    sections.steps.forEach(function (entry) {
      const secEntry = {
        date_time_start: moment.unix(entry.startTime).toISOString(),
        title: entry.concept !== null && entry.concept.title !== undefined ? entry.concept.title : null,
        description: entry.expression !== null && entry.expression.title !== undefined ? entry.expression.title : null,
        presenter: entry.concept !== null && entry.concept.producers !== undefined ? entry.concept.producers : null,
        img: entry.concept !== null && entry.concept.visual != null && entry.concept.visual.src !== undefined ? entry.concept.visual.src : null
      };

      newEntry.sections.push(secEntry);
    });

    prev.push(newEntry);
    return prev;
  }, []);

  return await Promise.resolve(cleanedData);
};

const fetch = dateStr => {
  let url = `https://www.radiofrance.fr/api/v1.7/stations/franceinter/programs?date=${dateStr}`;

  logger.log('info', `fetching ${url}`);

  return axios.get(url)
    .then(function (response) {
      // console.log(response.data.steps);
      scrapedData = scrapedData.concat(response.data.steps);
      // return resolve(true);
      // }).catch(() => resolve(true));
    });
};

const fetchAll = dateObj => {
  const previousDay = moment(dateObj);
  previousDay.subtract(1, 'days');

  return fetch(previousDay.format('DD-MM-YYYY'))
    .then(() => {
      return fetch(dateObj.format('DD-MM-YYYY'));
    });
};

const getScrap = dateObj => {
  return fetchAll(dateObj)
    .then(() => {
      return format(dateObj);
    });
};


const scrapModule = {
  getName: 'franceinter',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
