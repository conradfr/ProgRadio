const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');
const node_fetch = require('node-fetch');
const axios = require('axios');

const scrapedData = {};
const cleanedData = {};

const format = async (dateObj, name) => {
  if (cleanedData[name] === undefined) {
    cleanedData[name] = [];
  }

  const startDay = moment(dateObj).startOf('day');
  const endDay = moment(dateObj).endOf('day');

  scrapedData[name].forEach((curr) => {
    if (!curr) {
      return;
    }

    let data = null;
    if (curr && curr.steps) {
      data = curr.steps;
    }

    if (!data || (typeof scrapedData[name][data] !== 'object')) {
      return;
    }

    scrapedData[name][data].forEach((index) => {
      const dateTimeStart = moment.unix(scrapedData[name][scrapedData[name][index].startTime]);
      const dateTimeEnd = moment.unix(scrapedData[name][scrapedData[name][index].endTime]);

      if (dateTimeStart.isBefore(startDay)) {
        return;
      }

      if (dateTimeStart.isAfter(endDay)) {
        return;
      }

      const newEntry = {
        'date_time_start': dateTimeStart.toISOString(),
        'date_time_end': dateTimeEnd.toISOString(),
        'title': scrapedData[name][scrapedData[name][scrapedData[name][index].concept].title],
        'sections': []
      };

      if (scrapedData[name][scrapedData[name][index].expression] !== null) {
        if (scrapedData[name][scrapedData[name][scrapedData[name][index].expression].title]) {
          newEntry.description = scrapedData[name][scrapedData[name][scrapedData[name][index].expression].title];
        }

        if (scrapedData[name][scrapedData[name][scrapedData[name][index].expression].visual]
          && scrapedData[name][scrapedData[name][scrapedData[name][scrapedData[name][index].expression].visual].src]) {
          newEntry.img = scrapedData[name][scrapedData[name][scrapedData[name][scrapedData[name][index].expression].visual].src];
        }

        const host = [];
        if (scrapedData[name][scrapedData[name][scrapedData[name][index].expression].producers]) {
          scrapedData[name][scrapedData[name][scrapedData[name][index].expression].producers].forEach((element) => {
            host.push(scrapedData[name][scrapedData[name][element].name]);
          });
        }

        if (host.length > 0) {
          newEntry.host = host.join(', ');
        }
      }

      // sections

      if (scrapedData[name][scrapedData[name][index].children]
          && scrapedData[name][scrapedData[name][index].children] !== null) {
        scrapedData[name][scrapedData[name][index].children].forEach((index2) => {
          if (scrapedData[name][scrapedData[name][scrapedData[name][index2].expression]] === undefined) {
            return;
          }

          const dateTimeStart2 = moment.unix(scrapedData[name][scrapedData[name][index2].startTime]);
          const newSection = {
            'date_time_start': dateTimeStart2.toISOString(),
            'title': scrapedData[name][scrapedData[name][scrapedData[name][index2].expression].title]
          };

          if (scrapedData[name][scrapedData[name][scrapedData[name][index2].expression].body]) {
            newSection.descrition = scrapedData[name][scrapedData[name][scrapedData[name][index2].expression].body].replace(/\s\s+/g, ' ').split('\n').join(' ').trim();
          }

          const host2 = [];
          if (scrapedData[name][scrapedData[name][scrapedData[name][index2].expression].producers]) {
            scrapedData[name][scrapedData[name][scrapedData[name][index2].expression].producers].forEach((element) => {
              host2.push(scrapedData[name][scrapedData[name][element].name]);
            });
          }

          if (host2.length > 0) {
            newSection.presenter = host2.join(', ');
          }

          newEntry.sections.push(newSection);
        });
      }

      cleanedData[name].push(newEntry);
    });
  });

  return cleanedData[name];
};

const fetch = (name, dateObj, today) => {
  if (!today) {
    return Promise.resolve(false);
  }
  const dayStr = dateObj.format('DD-MM-YYYY');
  const url = today ? `https://www.radiofrance.fr/${name}/grille-programmes/__data.json?x-sveltekit-invalidated=1111`
    : `https://www.radiofrance.fr/${name}/grille-programmes/__data.json?date=${dayStr}&x-sveltekit-invalidated=1111`;

  logger.log('info', `fetching ${url}`);

  return axios.get(url).then((response) => {
    if (response.data && response.data.nodes && response.data.nodes && response.data.nodes[3].data) {
      scrapedData[name] = scrapedData[name].concat(response.data.nodes[3].data);
    }
  });
};

const fetchAll = (name, dateObj) => {
  const today = moment();
  scrapedData[name] = [];

  const previousDay = moment(dateObj);
  previousDay.subtract(1, 'days');

  return fetch(name, previousDay, today.isSame(previousDay, 'day'))
    .then(() => {
      return fetch(name, dateObj,today.isSame(dateObj, 'day'));
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
