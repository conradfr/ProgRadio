const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');

let scrapedData = [];

const format = dateObj => {
  dateObj.tz('UTC');

  // we use reduce instead of map to act as a map+filter in one pass
  const cleanedData = scrapedData.reduce(function(prev, curr) {
    if (typeof curr.json === 'undefined') {
      return prev;
    }
    const content = JSON.parse(curr.json.substr(21));

    if (content === "") {
      return prev;
    }

    let newEntry = {
      'title': curr.title,
      'description': curr.description,
      'img': content.contentReducer.visual.url
    };

    let regexp = new RegExp(/([0-9]{1,2})[h|H]([0-9]{2})/);
    let match = curr.datetime_raw.match(regexp);

    // no time, exit
    if (match === null) {
      return prev;
    }

    const startDateTime = moment(dateObj);
    startDateTime.hour(match[1]);
    startDateTime.minute(match[2]);
    startDateTime.second(0);

    newEntry.date_time_start = startDateTime.toISOString();

    prev.push(newEntry);
    return prev;
  },[]);

  return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
  dateObj.locale('fr');
  let dayFormat = dateObj.format('YYYY-MM-DD');
  let url = `http://www.mouv.fr/programmes/${dayFormat}`;

  logger.log('info', `fetching ${url}`);

    return new Promise(function(resolve, reject) {
        return osmosis
          .get(url)
          .select('.program-grid-step')
            .set({
              'datetime_raw': '.program-grid-step-timeline .time-plate',
              'title': '.program-grid-step-infos-upper-title',
              'img': '.color-spreaded-image visible img@src'
            })
          .do(
            osmosis.follow('.program-grid-step-infos-visual a@href')
              .find('body')
              .set({
                'description': '.content p',
                'json': 'script[1]',
              })
            )
            .data(function (listing) {
                scrapedData.push(listing);
            })
            .done(function () {
                resolve(true);
            })
    });
};

const fetchAll = dateObj =>  {
    return fetch(dateObj);
};

const getScrap = dateObj => {
    return fetchAll(dateObj)
        .then(() => {
            return format(dateObj);
        });
};

const scrapModule = {
    getName: 'mouv',
    supportTomorrow: false,
    getScrap
};

module.exports = scrapModule;
