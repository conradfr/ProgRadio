let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');
const axios = require('axios');
const node_fetch = require('node-fetch');

const scrapedData = {};
const cleanedData = {};

const fetchSections = async (id, name) => {
  const response = await node_fetch(`https://www.radiofrance.fr/api/v1.7/stations/${name}/programs/${id}/chronicles`);
  return await response.json();
};

const format = async (dateObj, name) => {
  const dayStr = dateObj.format('DD');
  const datetimeStored = [];

  // we use reduce instead of map to act as a map+filter in one pass
  cleanedData[name] = scrapedData[name].reduce(async function (prevP, curr, index, array) {
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
      'description': curr.expression && curr.expression.title ? curr.expression.title : null,
      'host': curr.concept.producers ? curr.concept.producers : null,
      'img': curr.concept.visual && curr.concept.visual.src ? curr.concept.visual.src : null,
      'sections': []
    };

    datetimeStored.push(moment.unix(curr.startTime));

    const sections = await fetchSections(curr.id, name);

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

  return await Promise.resolve(cleanedData[name]);
};

const fetch = (name, dateObj) => {
  const dayStr = dateObj.format('DD-MM-YYYY');
  let url = `https://www.radiofrance.fr/api/v1.7/stations/${name}/programs?date=${dayStr}`;

  logger.log('info', `fetching ${url}`);

  return axios.get(url)
    .then(function (response) {
      scrapedData[name] = scrapedData[name].concat(response.data.steps);
    });
};

const fetchAll = (name, dateObj) => {
  scrapedData[name] = [];

  const previousDay = moment(dateObj);
  previousDay.subtract(1, 'days');

  return fetch(name, previousDay)
    .then(() => {
      return fetch(name, dateObj);
    });
};

const getScrap = (name, dateObj) => {
  return fetchAll(name, dateObj)
    .then(() => {
      return format(dateObj, name);
    });
};

const scrapModuleAbstract = {
  getScrap,
  supportTomorrow: true,
};

module.exports = scrapModuleAbstract;
