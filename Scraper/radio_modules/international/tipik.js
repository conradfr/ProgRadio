const osmosis = require('osmosis');
let moment = require('moment-timezone');
const uniqBy = require('lodash.uniqby');
const logger = require('../../lib/logger.js');

let scrapedData = [];

const format = dateObj => {
  // we use reduce instead of map to act as a map+filter in one pass
  const cleanedData = scrapedData.reduce(function (prev, curr) {
    // Time
    let regexp = new RegExp(/([0-9]{1,2})[:]([0-9]{2})\s{0,1}[—|-]\s{0,1}([0-9]{1,2})[:]([0-9]{0,2})/);
    let match = curr.datetime_raw_text.match(regexp);

    // no time, exit
    if (match === null) {
      return prev;
    }

    const startDateTime = moment(curr.datetime_raw);
    const endDateTime = moment(curr.datetime_raw);

    endDateTime.hour(match[3]);
    endDateTime.minute(match[4]);
    endDateTime.second(0);

    // midnight etc
    if (startDateTime.hour() > endDateTime.hour()) {
      endDateTime.add(1, 'days');
    }

    const newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString(),
      'title': curr.title.trim(),
      'description': curr.description !== undefined && curr.descriotion !== null ? curr.description.trim() : null
    };

    if (curr.host !== undefined && curr.host !== null && curr.host.length > 0) {
      curr.host.forEach(element => {
        if (element.startsWith('Anima') !== true) {
          newEntry.host = element.replace(' , ', ', ').trim();
        }
      });
    }

    prev.push(newEntry);

    return prev;
  }, []);

  const cleanedDataDedup = uniqBy(cleanedData, 'date_time_start');

  return Promise.resolve(cleanedDataDedup);
};

const fetch = dateObj => {
  dateObj.locale('fr');
  const day = dateObj.format('YYYY-MM-DD');
  const hours = ['05', '08', '11', '14', '17', '20'];

  const promises = [];
  hours.forEach(time => {
    let url = `https://www.rtbf.be/tipik/grille/grid?date=${day}&time=${time}:00&channel=&accessibility=disable&week=false`;

    logger.log('info', `fetching ${url}`);

    promises.push(new Promise(function (resolve, reject) {
      return osmosis
        .get(url)
        .find('.col-xs-12.col-sm-6.no-gutter .list-unstyled.epg-grid-show-list')
        .select('.epg-grid-show-details')
        .set({
          'datetime_raw': 'span.hour@content',
          'datetime_raw_text': 'span.hour',
          'title': 'h3 a.js-showMore'
        })
        .do(
          osmosis.follow('h3 a.js-showMore@href')
            .set({
              'description': '.rtbf-article-main__content p',
              'host': ['.rtbf-article-main__content ul.list-unstyled[2] li text()']
            })
        )
        .data(function (listing) {
          scrapedData.push(listing);
        })
        .done(function () {
          resolve(true);
        })
    }));
  });

  return Promise.all(promises);
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
  getName: 'tipik',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
