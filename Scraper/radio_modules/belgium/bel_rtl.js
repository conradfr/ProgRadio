const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');

let scrapedData = [];

const format = dateObj => {

  // we use reduce instead of map to act as a map+filter in one pass
  const cleanedData = scrapedData.reduce(function (prev, curr, index, array) {

    // Time
    let regexp = new RegExp(/([0-9]{1,2}):([0-9]{1,2})/);
    let match = curr.datetime_raw.match(regexp);

    // no time, exit
    if (match === null) {
      return prev;
    }

    const startDateTime = moment(dateObj);

    startDateTime.hour(match[1]);
    startDateTime.minute(match[2]);
    startDateTime.second(0);

    newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'img': encodeURI(curr.img),
      'title': curr.title
    };

    if (curr.description !== undefined && curr.description !== null && curr.description !== '') {
      newEntry.description = curr.description;
    }

    if (curr.host !== undefined && curr.host !== null && curr.host !== '') {
      regexp = new RegExp(/avec (.*)/);
      match = curr.host.match(regexp);

      if (match !== null) {
        newEntry.host = match[1];
      }
    }

    prev.push(newEntry);
    return prev;
  }, []);

  return Promise.resolve(cleanedData);
};

const fetch = async dateObj => {
  dateObj.locale('fr');

  const day = dateObj.format('YYYY-MM-DD');
  const url = `https://www.rtl.be/belrtl/programmes?date=${day}`;

  logger.log('info', `fetching ${url}`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .select('.r-viewmode--prog-timeline')
      .set({
        'datetime_raw': '.r-article--time',
        'img': '.r-article--img img@src',
        'title': '.r-article--title a',
        'host': '.r-article--authors',
      })
      .do(
        osmosis.follow('.r-article--title > a.r-article--link@href')
          .set({
            'description': '.r-description-gen'
          })
      )
      .data(function (listing) {
        scrapedData.push(listing);
      })
      .done(function () {
        resolve(true);
      });
  });
};

const fetchAll = dateObj => {
  return fetch(dateObj);
};

const getScrap = dateObj => {
  return fetchAll(dateObj)
    .then(() => {
      return format(dateObj);
    });
};

const scrapModule = {
  getName: 'bel_rtl',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
