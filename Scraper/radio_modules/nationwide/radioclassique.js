const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');

let scrapedData = [];

const format = dateObj => {

  // we use reduce instead of map to act as a map+filter in one pass
  const cleanedData = scrapedData.reduce(function (prev, curr) {
    // apparently sometimes it's empty
    if (curr['datetime_raw'] === "") {
      return prev;
    }

    const date = moment.unix(parseInt(curr['datetime_raw']));
    date.second(0);

    delete curr.datetime_raw;
    curr.date_time_start = date.toISOString();

    // host is string as "par <host>"
    const regexp = new RegExp(/par(\n){0,1} (?<host>[\'\w\s\A-zÀ-ÿ\|]+)/);
    const match = curr.host_raw.match(regexp);

    if (match !== null && match.groups.host !== undefined) {
      curr.host = match.groups.host.trim();
    }
    delete curr.host_raw;

    // getting correctly formed url for images
    if (typeof curr.img === 'string' && curr.img.length > 0 && curr.img.substr(0, 4) !== 'http') {
      curr.img = 'https://www.radioclassique.fr' + curr.img;
    }

    // sections
    if (curr.subs !== undefined && curr.subs !== null && curr.subs.length > 0) {
      curr.sections = [];
      curr.subs.forEach(function (sub) {
        if (typeof sub === 'string') {
          return;
        }

        const newSub = {
          title: sub.title
        }

        // the offset outputted by the site is wrong (+00:00 instead of Europe/Paris' offset)
        const date_time_start = moment(sub.datetime_raw.replace('+00:00', '')).tz('Europe/Paris');
        newSub.date_time_start = date_time_start.toISOString()

        // host is string as "par <host>"
        const match = sub.host_raw.match(regexp);

        if (match !== null && match.groups.host !== undefined) {
           newSub.presenter = match.groups.host.trim();
        }

        curr.sections.push(newSub);
      });
    }

    delete curr.subs;
    prev.push(curr);

    return prev;
  }, []);

  return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
  let dayFormat = dateObj.format('YYYY-MM-DD');
  let url = `https://www.radioclassique.fr/radio/grille-des-programmes/${dayFormat}/`;

  logger.log('info', `fetching ${url}`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .find('.timeline__block__row')
      .set({
        'datetime_raw': 'time@data-time', /* utc */
        'subs': [
          osmosis.find('.timeline__block__content__sub_item')
            .set({
              'datetime_raw': 'time@datetime',
              'title': 'p a',
              'host_raw': 'p em'
            })
        ]
      })
      .select('.timeline__block__content > .timeline__block__content__item > p')
      .set({
        'title': 'a',
        'host_raw': 'em'/*,
                'description':  '.timeline__guest > .media > p'*/
      })
      .do(
        osmosis.follow('a@href')
          .find('.program__block')
          .set({
            'img': '.block-image > img@data-lazy-src',
            'description': '.program__block__content > p[2]'
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
  getName: 'radioclassique',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
