const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');
const node_fetch = require('node-fetch');

const scrapedData = {};
const cleanedData = {};

const fetchSections = async (id) => {
  const response = await node_fetch(`https://www.radiofrance.fr/franceinter/api/grid/${id}`);
  return await response.json();
};

const format = async (dateObj, name) => {
  if (cleanedData[name] === undefined) {
    cleanedData[name] = [];
  }

  const startDay = moment(dateObj).startOf('day');
  const endDay = moment(dateObj).endOf('day');

  await scrapedData[name].forEach(async curr => {
    const textStart = curr.json_raw.indexOf('const data = [');
    const textEnd = curr.json_raw.indexOf('Promise.all([');

    const jsonExtracted = curr.json_raw.substring(textStart + 13, + textEnd).trim();
    const dataRaw = eval(jsonExtracted.substring(0, jsonExtracted.length - 1));

    let data = [];

    dataRaw.forEach(entry => {
      if (entry.data
        && entry.data.grid && entry.data.grid['steps'] !== undefined) {
        data = entry.data.grid['steps'];
      }
    });

    if (!data || data.length === 0) {
      return;
    }

    data.reduce(async (prev, entry) => {
      const dateTimeStart = moment.unix(entry.startTime);
      const dateTimeEnd = moment.unix(entry.endTime);

      if (dateTimeStart.isBefore(startDay)) {
        return;
      }

      if (dateTimeStart.isAfter(endDay)) {
        return;
      }

      const newEntry = {
        'id': entry.id,
        'date_time_start': dateTimeStart.toISOString(),
        'date_time_end': dateTimeEnd.toISOString(),
        'title': entry.concept.title,
        'description': entry.expression && entry.expression.title ? entry.expression.title : null,
        'host': entry.concept.producers ? entry.concept.producers : null,
        'img': entry.expression && entry.expression.visual && entry.expression.visual.src ? entry.expression.visual.src : null,
        'sections': []
      };

      cleanedData[name].push(newEntry);
      return prev;
    });
  });

  // sections
  results = await Promise.all(cleanedData[name].map(async entry => {
    const sections = await fetchSections(entry.id);

    if (sections && sections.length > 0) {
      sections.forEach(sectionEntry => {
        const sectionDateStart = moment.unix(sectionEntry.startTime);
        const section = {
          'date_time_start': sectionDateStart.toISOString(),
          'title': sectionEntry.concept.title,
          'presenter': sectionEntry.concept.producers ? sectionEntry.concept.producers : null,
          'img': sectionEntry.expression && sectionEntry.expression.visual && sectionEntry.expression.visual.src ? sectionEntry.expression.visual.src : null,
        };

        entry.sections.push(section);
      });
    }

    delete entry.id;
    return entry;
  }));

  return Promise.resolve(results);
  // return await Promise.resolve(cleanedData[name]);
};

const fetch = (name, dateObj) => {
  const dayStr = dateObj.format('DD-MM-YYYY');
  let url = `https://www.radiofrance.fr/${name}/grille-programmes?date=${dayStr}`;

  logger.log('info', `fetching ${url}`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .find('body')
      .set({
        'json_raw': 'script'
      })
      .data(function (listing) {
        // listing.main = sections !== true;
        listing.dateObj = dateObj;
        scrapedData[name].push(listing);
      })
      .done(function () {
        resolve(true);
      })
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
    .then(async () => {
      return await format(dateObj, name);
    });
};

const scrapModuleAbstract = {
  getScrap,
  supportTomorrow: true,
};

module.exports = scrapModuleAbstract;
