const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');

let scrapedData = {};
let cleanedData = {};

const format = (dateObj, name) => {
  // we use reduce instead of map to act as a map+filter in one pass
  cleanedData[name] = scrapedData[name].reduce(function (prev, curr) {
    const date = moment(curr['datetime_raw']);

    const newEntry = {
      'title': curr.title.trim(),
      'description': curr.description,
      'date_time_start': date.toISOString(),
      'img': `${process.env.PROXY_URL}rfi.jpg?key=${process.env.PROXY_KEY}&url=${curr.img}`
    };

    if (curr.host_raw !== undefined) {
      newEntry['host'] = curr.host_raw.replace('Par : ', '').trim();
    }

    prev.push(newEntry);
    return prev;
  }, []);

  return Promise.resolve(cleanedData[name]);
};

const fetch = (dateObj, name, url) => {
  dateObj.locale('fr');

  logger.log('info', `fetching ${url}`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      // for some reason the website return a 404
      .config({
        ignore_http_errors: true
      })
      .select('.o-layout-list__item')
      .set({
        'datetime_raw': '.m-item-program-grid__timeline__time@datetime',
      })
      .set({
        'img': 'noscript > img.m-figure__img@src',
        'title': '.m-item-program-grid__infos__titles .m-item-program-grid__infos__program-title',
        'host_raw': '.m-item-program-grid__infos__titles .m-item-program-grid__infos__edition-authors',
      })
      .do(
        osmosis.follow('a.m-item-program-grid__infos__link@href')
          .set({
            'description': '.t-content__chapo'
          })
      )
      .data(function (listing) {
        listing.dateObj = dateObj;
        scrapedData[name].push(listing);
      })
      .done(function () {
        resolve(true);
      })
  });
};

const fetchAll = (dateObj, name, url) => {
  return fetch(dateObj, name, url);
};

const getScrap = (dateObj, name, url) => {
  scrapedData[name] = [];
  return fetchAll(dateObj, name, url)
    .then(() => {
      return format(dateObj, name);
    });
};

const scrapModule = {
  supportTomorrow: false,
  getScrap
};

module.exports = scrapModule;
