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

    let regexp = new RegExp(/([0-9]{1,2})[h|H]([0-9]{2})/);
    let match = curr.datetime_raw.match(regexp);

    if (!match) {
        return prev;
    }

    const currDateTime = moment(curr.dateObj);
    currDateTime.hour(match[1]);
    currDateTime.minute(match[2]);
    currDateTime.second(0);

    // webpage results are 5h -> 5h

    // this is previous day
    if (currDateTime.isBefore(dateObj, 'day')) {
        // this is previous day normal scheduling, ignoring
        if (currDateTime.hours() > 4) {
            return prev;
        }

        currDateTime.add(1, 'days');
    } else {
        // this is next day normal scheduling, ignoring
        if (currDateTime.hours() < 5) {
            return prev;
        }
    }

    const newEntry = {
      'date_time_start': currDateTime.toISOString(),
      'title': curr.title || curr.title_alt,
      'img': curr.img ? curr.img : null,
      'sections': []
    };

    if (curr.description) {
        regexp = new RegExp(/^(.*):(.*)$/s);
        match = curr.description.match(regexp);
        if (match) {
            newEntry['description'] = match[1].trim();
            newEntry['host'] = match[2].trim();
        } else {
            newEntry['description'] = curr.description;
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
      .find('.timeline-item')
      .set({
        'datetime_raw': '.timeline_text',
        'date_raw': '.typo-text-small', // utc
        'img': 'img.ImageRatio-img@src',
        'title': '.title > a',
        'title_alt': '.title',
        'description': '.typo-text-web-adjusted',
        // 'host': '.TimeSlotContent-producers'
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
