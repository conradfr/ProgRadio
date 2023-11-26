const osmosis = require('osmosis');
const fixUtf8 = require('fix-utf8');
let moment = require('moment-timezone');
let util = require('util');
const logger = require('../../lib/logger.js');

let scrapedData = [];

const fetchDesc = async (url) => {
  let data = null;
  return new Promise(function (resolve, reject) {
    return osmosis
      .get(`https://www.bide-et-musique.com${url}`)
      .set({
        'description': '#presprog'
      })
      .data(function(listing) {
        data = listing;
      })
      .done(function () {
        resolve(data);
      });
  });
};

const format = async dateObj => {
  dateObj.tz('Europe/Paris');
  let currentDay = false;

  const cleanedData = scrapedData.reduce(async function (prevP, entry) {
    const prev = await prevP;
    if (entry.day_col !== undefined) {
      const dayFormat = dateObj.format('dddd D');

      // substr because encoding problem apparently with accents in months
      if (dayFormat === entry.day_col.toLowerCase().substring(0, dayFormat.length)) {
        currentDay = true;
      } else {
        currentDay = false;
      }

      return prev;
    }

    if (currentDay === false || util.isNullOrUndefined(entry.datetime_raw)) {
      return prev;
    }

    let startDateTime = moment(dateObj);
    const endDateTime = moment(dateObj);

    let regexp = new RegExp(/^([0-9]{1,2})[h|H]([0-9]{2}) - ([0-9]{1,2})[h|H]([0-9]{2})/, 'u');
    let match = entry.datetime_raw.match(regexp);

    if (match !== null) {
      startDateTime.hour(match[1]);
      startDateTime.minute(match[2]);
      startDateTime.second(0);
      endDateTime.hour(match[3]);
      endDateTime.minute(match[4]);
      endDateTime.second(0);
    } else {
      return prev;
    }

    if (startDateTime.hour() > endDateTime.hour()) {
      endDateTime.add(1, 'days');
    }

    // !!!! Apparently the page reports being encodeed as ISO but is actually UTF8,
    // and Osmosis (via libxml) doesn't handle the case

    const newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString(),
      'title': fixUtf8(entry.title.replace(/ /g, ' ').replace(/Ã/g, 'É'))
    };

    if (entry.link !== undefined && entry.link !== null) {
      let description = await fetchDesc(entry.link);
      if (description.description !== undefined && description.description !== null) {
        // description = description.description.replace(/(\r\n|\n|\r)/gm, '').trim();
        description = fixUtf8(description.description).replace(/ /g, ' ').replace(/\s\s+/g, ' ');
        if (description !== '') {
          newEntry.description = description;
        }
      }
    }

    prev.push(newEntry);
    return prev;
  }, []);

  return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
  const url = 'https://www.bide-et-musique.com/grille.html';
  dateObj.locale('fr');

  logger.log('info', `fetching ${url}`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .find('.bmtable tr')
      .set({
        'datetime_raw': 'td:first',
        'title': 'td > a',
        'link': 'td > a@href',
        'day_col': 'td[colspan="3"]'
      })
/*
    commented has we have to do separately to keep order of the rows
  .do(
        osmosis.follow('td > a@href')
          .set({
            'description': '#presprog'
          })
      )*/
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
  getName: 'bideetmusique',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
