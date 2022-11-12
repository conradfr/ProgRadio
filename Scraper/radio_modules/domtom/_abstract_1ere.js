const osmosis = require('osmosis');
const moment = require('moment-timezone');
const mm = require('music-metadata');
const logger = require('../../lib/logger.js');
const node_fetch = require('node-fetch');

const DURATION_MIN = 5;

const dayFr = {
  'lundi': 1,
  'mardi': 2,
  'mercredi': 3,
  'jeudi': 4,
  'vendredi': 5,
  'samedi': 6,
  'dimanche': 7
};

const getDuration = async (url) => {
  try {
    const response = await node_fetch(url);
    const metadata = await mm.parseStream(response.body, {mimeType:  'audio/mpeg'}, {duration: true});

    if (metadata.format.duration === null) {
      return false;
    } else {
     return metadata.format.duration;
    }
  } catch (error) {
    return false;
  }
}

let scrapedData = {};
let cleanedData = {};

const format = (dateObj, dayWanted, name) => {
  const dayWantedStart = moment(dayWanted);
  dayWantedStart.hour(0);
  dayWantedStart.minute(0);
  dayWantedStart.second(0);

  const dayWantedEnd = moment(dayWanted);
  dayWantedEnd.hour(23);
  dayWantedEnd.minute(59);
  dayWantedEnd.second(59);

  // we use reduce instead of map to act as a map+filter in one pass
  cleanedData[name] = scrapedData[name].reduce(function (prev, curr) {
    let matchedDay = false;
    let match = null;
    const dayNum = dateObj.isoWeekday();

    // day range
    let regexp = new RegExp(/(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\sau\s(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)/);
    match = curr.datetime_host.toLowerCase().match(regexp);

    if (match !== null) {
      // not in day interval
      if (dayNum < dayFr[match[1]] || dayNum > dayFr[match[2]]) {
        return prev;
      } else {
        matchedDay = true;
      }
    }

    // two days
    if (matchedDay === false) {
      regexp = new RegExp(/(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\set\s(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)/);
      match = curr.datetime_host.toLowerCase().match(regexp);

      if (match !== null) {
        // not one of days
        if (dayNum !== dayFr[match[1]] && dayNum !== dayFr[match[2]]) {
          return prev;
        } else {
          matchedDay = true;
        }
      }
    }

    // one day
    if (matchedDay === false) {
      regexp = new RegExp(/(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)/);
      match = curr.datetime_host.toLowerCase().match(regexp);

      if (match !== null) {
        // not day
        if (dayNum !== dayFr[match[1]]) {
          return prev;
        } else {
          matchedDay = true;
        }
      }
    }

    // everyday
    if (matchedDay === false) {
      if (curr.datetime_host.includes('ous les jours') === true) {
        matchedDay = true;
      }
    }

    if (matchedDay === false) {
      return prev;
    }

    let isSection = false;
    let matchTime = null;

    // 14h à 16h00, getting the start
    regexp = new RegExp(/([0-9]{1,2})[h|H]([0-9]{0,2})\sà\s/);
    matchTime = curr.datetime_host.match(regexp);

    if (matchTime !== null) {
      if (matchTime.length === 2) {
        matchTime[2] = 0;
      }

      // getting the end
      regexp = new RegExp(/\sà\s([0-9]{1,2})[h|H]([0-9]{0,2})/);
      const matchTimeSupp = curr.datetime_host.match(regexp);

      // should not be null
      if (matchTimeSupp !== null) {
        matchTime[3] = matchTimeSupp[1];

        if (matchTimeSupp.length === 2) {
          matchTime[4] = 0;
        } else {
          matchTime[4] = matchTimeSupp[2];
        }
      }
    }

    // section ?
    if (matchTime === null) {
      regexp = new RegExp(/à\s([0-9]{1,2})[h|H]([0-9]{0,2})/);
      matchTime = curr.datetime_host.match(regexp);

      if (matchTime !== null) {
        isSection = true;
        if (matchTime.length === 2) {
          matchTime[2] = 0;
        }
      }
    }

    if (matchTime === null) {
      return prev;
    }

    const newEntry = {
      img: curr.img,
      title: curr.title,
      description: curr.description !== undefined ? curr.description.trim() : null,
      sections: []
    };

    const startDateTime = moment(curr.dateObj);
    startDateTime.tz(dateObj.tz());
    const endDateTime = moment(curr.dateObj);
    endDateTime.tz(dateObj.tz());

    startDateTime.hour(matchTime[1]);
    startDateTime.minute(matchTime[2]);
    startDateTime.second(0);

    newEntry.date_time_start = startDateTime.toISOString();

    if (isSection === false) {
      endDateTime.hour(matchTime[3]);
      endDateTime.minute(matchTime[4]);
      endDateTime.second(0);

      newEntry.date_time_end = endDateTime.toISOString();
    }

    // host

    regexp = new RegExp(/Présenté par ([A-Za-z]*\s[A-Za-z]*\set\s[A-Za-z]*\s[A-Za-z]*)/);
    let matchHost = curr.datetime_host.match(regexp);

    if (matchHost !== null) {
      if (isSection === false) {
        newEntry.host = matchHost[1];
      } else {
        newEntry.presenter = matchHost[1];
      }
    } else {
      regexp = new RegExp(/Présenté par ([A-Za-z]*\s[A-Za-z]*)/);
      matchHost = curr.datetime_host.match(regexp);

      if (matchHost !== null) {
        if (isSection === false) {
          newEntry.host = matchHost[1];
        } else {
          newEntry.presenter = matchHost[1];
        }
      }
    }

    if (isSection === true) {
      delete newEntry.sections;
      prev['sections'].push(newEntry);
    } else {
      prev['shows'].push(newEntry);
    }

    return prev;
  }, {
    'shows': [],
    'sections': []
  });

  // remove wrong day
  let finalShows = [];
  let finalSections = [];

  for (let [index, show] of cleanedData[name]['shows'].entries()) {
    if (moment(show.date_time_start).isBetween(dayWantedStart, dayWantedEnd) === true) {
      finalShows.push(cleanedData[name]['shows'][index]);
    }
  }

  for (let [index, section] of cleanedData[name]['sections'].entries()) {
    if (moment(section.date_time_start).isBetween(dayWantedStart, dayWantedEnd) === true) {
      finalSections.push(cleanedData[name]['sections'][index]);
    }
  }

  // assign sections to shows
  const unassignedSections = [];
  for (let section of finalSections) {
    let unassigned = true;
    for (let [index, show] of finalShows.entries()) {
      if (moment(section.date_time_start).isBetween(moment(show.date_time_start), moment(show.date_time_end)) === true) {
        unassigned = false;
        if (section.podcast !== undefined) {
          delete(section.podcast);
        }

        finalShows[index].sections.push(section);
        break;
      }
    }
    if (unassigned === true) {
      unassignedSections.push(section);
    }
  }

  return Promise.resolve(finalShows);
};

const fetch = (dateObj, name, url) => {
  logger.log('info', `fetching ${url}`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .select('.m-card')
      .set({
        // 'img': 'img.a-image@src',
        'datetime_host': '.m-card__description',
        'title': '.m-card__title',
      })
      .do(
        osmosis.follow('a.m-card__link@href')
          .set({
            'img': 'img.a-image@src',
            'description': '.description',
            // 'podcast': '.player-standard audio@src'
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

const fetchAll = (dateObj, dateWantedObj, name, url) => {
  const diff = dateWantedObj.utcOffset() - dateObj.utcOffset();
  const otherDayObj = moment(dateObj) ;

  // positive = after France metro so we need previous day + day
  // negative = before France metro so we need day + next day
  if (diff > 0) {
    otherDayObj.subtract(1, 'days');
  } else {
    otherDayObj.add(1, 'days');
  }

  return fetch(otherDayObj, name, url)
    .then(() => {
      return fetch(dateObj, name, url);
    });

};

const getScrap = (dateObj, dateWantedObj, name, url) => {
  dateObj.locale('fr');

  scrapedData[name] = [];
  return fetchAll(dateObj, dateWantedObj, name, url)
    .then(() => {
      return format(dateObj, dateWantedObj, name);
    });
};

const scrapModule = {
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
