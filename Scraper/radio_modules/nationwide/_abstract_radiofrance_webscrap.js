const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');

const scrapedData = {};
const cleanedData = {};

const format = async (dateObj, name) => {
  const dayStart = moment(dateObj);
  dayStart.hour(0);
  dayStart.minute(0);
  dayStart.second(0);

  const dayEnd = moment(dateObj);
  dayEnd.hour(23);
  dayEnd.minute(59);
  dayEnd.second(59);

  // we use reduce instead of map to act as a map+filter in one pass
  cleanedData[name] = scrapedData[name].reduce(async function (prevP, curr, index, array) {
    const prev = await prevP;
    const currDateTime = moment(curr.datetime_raw);

    if (currDateTime.isBefore(dayStart) || currDateTime.isAfter(dayEnd)) {
      return prev;
    }

    const newEntry = {
      'date_time_start': currDateTime.toISOString(),
      'title': curr.title,
      'description': curr.description ? curr.description : null,
      'img': curr.img ? curr.img : null,
      'sections': []
    };

    if (curr.host) {
      // host is string as "par <host>"
      const regexp = new RegExp(/Par(\n){0,1} (?<host>[\'\w\s\A-zÀ-ÿ\|]+)/);
      const match = curr.host.match(regexp);

      if (match !== null && match.groups.host !== undefined) {
        newEntry.host = match.groups.host.trim();
      }
    }

    prev.push(newEntry);
    return prev;
  }, []);

  return await Promise.resolve(cleanedData[name]);
};

const fetch = (name, dateObj) => {
  const dayStr = dateObj.format('DD-MM-YYYY');
  let url = `https://www.radiofrance.fr/${name}/grille-programmes?date=${dayStr}`;

  logger.log('info', `fetching ${url}`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .find('.g-container.Programs .Programs-grid .TimeSlotContainer')
      .set({
        'datetime_raw': 'time@datetime', // utc
        'img': 'picture source[data-testid="image-src"]@srcset',
        'title': '.TimeSlotContent-title',
        'description': '.TimeSlotContent-subtitle',
        'host': '.TimeSlotContent-producers'
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
    .then(() => {
      return format(dateObj, name);
    });
};

const scrapModuleAbstract = {
  getScrap,
  supportTomorrow: true,
};

module.exports = scrapModuleAbstract;
