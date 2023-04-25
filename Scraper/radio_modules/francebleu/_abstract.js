let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');
const axios = require("axios");

let scrapedData = {};
const schedule = {};

const when = ['morning', 'midday', 'afternoon', 'evening'];

const format = async (dateObj, name) => {
  dateObj.tz('Europe/Paris');

  // not using forEach as it does not work with await
  for (const key of Object.keys(scrapedData[name])) {
    for (const dayWhen of when) {
      if (!scrapedData[name][key][dayWhen]) {
        continue;
      }

      if (key === 'prev' && dayWhen !== 'evening') {
        continue;
      }

      for (const data of scrapedData[name][key][dayWhen]) {
        let regexp = new RegExp(/([0-9]{1,2})[h|H]([0-9]{2})/);
        let match = data.start.match(regexp);

        if (match === null) {
          continue;
        }

        if (key === 'prev' && match[1] > 3) {
          continue;
        }

        if (key === 'curr' && match[1] < 3) {
          continue;
        }

        let match2 = data.end.match(regexp);

        if (match2 === null) {
          continue;
        }

        const startDateTime = moment(dateObj);
        const endDateTime = moment(dateObj);

        startDateTime.hour(match[1]);
        startDateTime.minute(match[2]);
        startDateTime.second(0);
        endDateTime.hour(match2[1]);
        endDateTime.minute(match2[2]);
        endDateTime.second(0);

        const newEntry = {
          'date_time_start': startDateTime.toISOString(),
          'date_time_end': endDateTime.toISOString(),
          'title': data.title,
          'img': 'https://www.francebleu.fr/images/emission-fallback.png',
          'sections': []
        }

        if (data.authors) {
          const host = data.authors.reduce(function (acc, curr) {
            acc.push(curr.title);
            return acc;
          }, []);

          if (host.length > 0) {
            newEntry.host = host.join(', ');
          }
        }

        if (data.visual && data.visual.mobile && data.visual.mobile.url) {
          newEntry.img = data.visual.mobile.url;
        }

        if (data.path) {
          try {
            const res = await axios.get(`https://www.francebleu.fr/api/path?value=${data.path}`);

            if (res.data.context.Concept.body[0].children[0].value) {
              newEntry.description = res.data.context.Concept.body[0].children[0].value;
            }

          } catch (error) {
            // Handle errors
          }
        }

        // sections
        if (data.columns && data.columns.length > 0) {
          data.columns.forEach(subData => {
            let match3 = subData.start.match(regexp);
            if (match3 === null) {
              return;
            }

            const subStartDateTime = moment(dateObj);
            subStartDateTime.hour(match3[1]);
            subStartDateTime.minute(match3[2]);
            subStartDateTime.second(0);

            const subEntry = {
              'date_time_start': subStartDateTime.toISOString(),
              'title': subData.title
            };

            if (subData.authors) {
              const host = subData.authors.reduce(function (acc, curr) {
                acc.push(curr.title);
                return acc;
              }, []);

              if (host.length > 0) {
                subEntry.host = host.join(', ');
              }

              if (subData.visual && subData.visual.mobile && subData.visual.mobile.url) {
                subEntry.img = subData.visual.mobile.url;
              }
            }

            newEntry.sections.push(subEntry);
          });
        }

        schedule[name].push(newEntry);
      }
    }
  }

  // console.log(schedule[name]);

  return Promise.resolve(schedule[name])
};

const fetch = async (urlName, name, dateObj, prev) => {
  dateObj.locale('fr');
  const format = 'YYYY-MM-DD';

  const url = `https://www.francebleu.fr/api/path?date=${dateObj.format(format)}&value=emissions%2Fgrille-programmes%2F${urlName}`;

  logger.log('info', `fetching ${url}`);

  try {
    const response = await axios.get(url);

    if (prev === true) {
      scrapedData[name].prev = response.data.context.ProgramGridLocale;
    } else {
      scrapedData[name].curr = response.data.context.ProgramGridLocale;
    }
  } catch(error) {

  }

  return true;
};

const fetchAll = async (urlName, name, dateObj) => {
  const previousDay = moment(dateObj);
  previousDay.locale('fr');
  previousDay.subtract(1, 'days');

  await await fetch(urlName, name, previousDay, true);
  return await fetch(urlName, name, dateObj, false);
};

const getScrap = async (dateObj, urlName, name) => {
  schedule[name] = [];
  scrapedData[name] = {
    prev: {},
    curr: {}
  };

  await fetchAll(urlName, name, dateObj);
  return await format(dateObj, name)
};

const scrapModuleAbstract = {
  supportTomorrow: false,
  getScrap
};

module.exports = scrapModuleAbstract;
