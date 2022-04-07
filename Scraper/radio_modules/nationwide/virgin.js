const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');
const utils = require('../../lib/utils');

let scrapedData = [];
let referenceIndex = 0;

const format = dateObj => {

  // we use reduce instead of map to act as a map+filter in one pass
  const cleanedData = scrapedData.reduce(function (prev, curr, index, array) {

    // Time
    regexp = new RegExp(/([0-9]{1,2})[h|H]([0-9]{0,2})\s[à|–]\s([0-9]{1,2})[h|H]([0-9]{0,2})/);
    let match_time = curr.datetime_raw.match(regexp);

    // no time, exit
    if (match_time === null) {
      return prev;
    }

    // Should not have next day end by let's ignore if any
    if (match_time[1] > match_time[3]) {
      return prev;
    }

    const startDateTime = moment(curr.dateObj);
    const endDateTime = moment(curr.dateObj);

    startDateTime.hour(match_time[1]);
    if (match_time[2] !== '') {
      startDateTime.minute(match_time[2]);
    } else {
      startDateTime.minute(0);
    }

    endDateTime.hour(match_time[3]);
    if (match_time[4] !== '') {
      endDateTime.minute(match_time[4]);
    } else {
      endDateTime.minute(0);
    }

    startDateTime.second(0);
    endDateTime.second(0);

    newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString(),
      'img': curr.img,
      'title': curr.title
    };

    if (curr.host.length > 11) {
      newEntry.host = curr.host.substr(11)
        .replace(/ , /g, ', ')
        .replace(' sur Virgin Radio', '')
        .replace(' - Virgin Tonic', '')
        .trim();
    }

    prev.push(newEntry);
    return prev;
  }, []);

  return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
    dateObj.locale('fr');
    const day = utils.upperCaseWords(dateObj.format('dddd'));

    let url = 'https://www.virginradio.fr/programmes';

    logger.log('info', `fetching ${url} (${day})`);

    return new Promise(function (resolve, reject) {
      return osmosis
        .get(url)
        .find(`#${day}`)
        .select('.row.podcasts-single')
        .set({
          'datetime_raw': '.podcasts-single-term-date',
          'img': 'img.podcasts-single-term-infos-thumb@src',
          'title': '.podcasts-single-term-title > a',
          'host': '.podcasts-single-term-infos-content > p'
        })
        .data(function (listing) {
          listing.dateObj = dateObj;
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
  getName: 'virgin',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
