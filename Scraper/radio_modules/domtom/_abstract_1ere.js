const osmosis = require('osmosis');
const moment = require('moment-timezone');
const mm = require('music-metadata');
const util = require('util');
const https = require('https');
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
    for (let entry of curr.datetime_host) {
      if (matchedDay === false) {
        let regexp = new RegExp(/(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\sau\s(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)/);
        match = entry.toLowerCase().match(regexp);

        if (match !== null) {
          // not in day interval
          const dayNum = dateObj.isoWeekday();

          if (dayNum < dayFr[match[1]] || dayNum > dayFr[match[2]]) {
            return prev;
          } else {
            matchedDay = true;
            break;
          }
        }

        regexp = new RegExp(/(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\set\s(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)/);
        match = entry.toLowerCase().match(regexp);

        if (match !== null) {
          // not one of days
          const dayNum = dateObj.isoWeekday();

          if (dayNum !== dayFr[match[1]] && dayNum !== dayFr[match[2]]) {
            return prev;
          } else {
            matchedDay = true;
            break;
          }
        }

        regexp = new RegExp(/(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)/);
        match = entry.toLowerCase().match(regexp);

        if (match !== null) {
          // not day
          const dayNum = dateObj.isoWeekday();

          if (dayNum !== dayFr[match[1]]) {
            return prev;
          } else {
            matchedDay = true;
            break;
          }
        }

        if (entry.includes('ous les jours') === true) {
          matchedDay = true;
          break;
        }
      }
    }

    if (matchedDay === false) {
      return prev;
    }

    let timeMatched = false;
    let isSection = false;
    let matchTime = null;
    let isMultiple = false;
    for (let entry2 of curr.datetime_host) {

      // 14h à 16h00.
      regexp = new RegExp(/([0-9]{1,2})[h|H]([0-9]{0,2})\sà\s/);
      matchTime = entry2.match(regexp);

      if (matchTime !== null) {
        if (matchTime.length === 2) {
          matchTime[2] = 0;
        }

        regexp = new RegExp(/\sà\s([0-9]{1,2})[h|H]([0-9]{0,2})/);
        const matchTimeSupp = entry2.match(regexp);

        // should not be null
        if (matchTimeSupp !== null) {
          matchTime[3] = matchTimeSupp[1];

          if (matchTimeSupp.length === 2) {
            matchTime[4] = 0;
          } else {
            matchTime[4] = matchTimeSupp[2];
          }
        }

        timeMatched = true;

        regexp = new RegExp(/\spuis\s([0-9]{1,2})[h|H]([0-9]{0,2})\sà(.*)/);
        matchTimeMultiple = entry2.match(regexp);
        if (matchTimeMultiple !== null) {
          isMultiple = true;
          matchTime[5] = matchTimeMultiple[1];
          if (matchTimeMultiple.length === 3) {
            matchTime[6] = 0;
          } else {
            matchTime[6] = matchTimeMultiple[2];
          }

          const restOfText = matchTimeMultiple.length === 3 ? matchTimeMultiple[2] : matchTimeMultiple[3];
          regexp = new RegExp(/([0-9]{1,2})[h|H]([0-9]{0,2})/);
          matchTimeMultiple = restOfText.match(regexp);

          // should not be null
          if (matchTimeMultiple !== null) {
            matchTime[7] = matchTimeMultiple[1];

            if (matchTimeSupp.length === 2) {
              matchTime[8] = 0;
            } else {
              matchTime[8] = matchTimeMultiple[2];
            }
          }
        }

        break;
      }

      // 8h-11h

      regexp = new RegExp(/([0-9]{1,2})[h|H]([0-9]{0,2})-/);
      matchTime = entry2.match(regexp);

      if (matchTime !== null) {
        if (matchTime.length === 2) {
          matchTime[2] = 0;
        }

        regexp = new RegExp(/-([0-9]{1,2})[h|H]([0-9]{0,2})/);
        const matchTimeSupp = entry2.match(regexp);

        // should not be null
        if (matchTimeSupp !== null) {
          matchTime[3] = matchTimeSupp[1];

          if (matchTimeSupp.length === 2) {
            matchTime[4] = 0;
          } else {
            matchTime[4] = matchTimeSupp[2];
          }
        }

        timeMatched = true;
        break;
      }

      regexp = new RegExp(/à\s([0-9]{1,2})[h|H]([0-9]{0,2})/);
      matchTime = entry2.match(regexp);

      if (matchTime !== null) {
        if (matchTime.length === 2) {
          matchTime[2] = 0;
        }

        regexp = new RegExp(/\set\s([0-9]{1,2})[h|H]([0-9]{0,2})/);
        matchTimeMultiple = entry2.match(regexp);

        if (matchTimeMultiple !== null) {
          isMultiple = true;
          matchTime[3] = matchTimeMultiple[1];
          if (matchTimeMultiple.length === 2) {
            matchTime[4] = 0;
          } else {
            matchTime[4] = matchTimeMultiple[2];
          }
        }

        timeMatched = true;
        isSection = true;
        break;
      }
    }

    if (timeMatched === false) {
      return prev;
    }

    const newEntry = {
      img: curr.img,
      title: curr.title,
      description: curr.description.join(' ').trim(),
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

    for (let entry3 of curr.datetime_host) {
      regexp = new RegExp(/Présenté par (.*)/);
      const matchHost = entry3.match(regexp);

      if (matchHost !== null) {
        if (isSection === false) {
          newEntry.host = matchHost[1];
        } else {
          newEntry.presenter = matchHost[1];
        }

        break;
      }
    }

    if (isSection === true) {
      if (curr.podcast !== undefined) {
        newEntry.podcast = curr.podcast;
      }

      prev['sections'].push(newEntry);

      if (isMultiple === true) {
        const newEntryCopy = Object.assign({}, newEntry);
        const startDateTime2 = moment(curr.dateObj);
        startDateTime2.tz(dateObj.tz());
        startDateTime2.hour(matchTime[3]);
        startDateTime2.minute(matchTime[4]);
        startDateTime2.second(0);
        newEntryCopy.date_time_start = startDateTime2.toISOString();
        prev['sections'].push(newEntryCopy);
      }
    } else {
      prev['shows'].push(newEntry);

      if (isMultiple === true) {
        const newEntryCopy = Object.assign({}, newEntry);
        const startDateTime2 = moment(curr.dateObj);
        startDateTime2.tz(dateObj.tz());
        startDateTime2.hour(matchTime[5]);
        startDateTime2.minute(matchTime[6]);
        startDateTime2.second(0);
        newEntryCopy.date_time_start = startDateTime2.toISOString();

        const endDateTime2 = moment(curr.dateObj);
        endDateTime2.tz(dateObj.tz());
        endDateTime2.hour(matchTime[7]);
        endDateTime2.minute(matchTime[8]);
        endDateTime2.second(0);
        newEntryCopy.date_time_end = endDateTime2.toISOString();
        prev['shows'].push(newEntryCopy);
      }
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

  // try to get last unused section podcast length and convert it to a show.
  const promises = [];

  for (let unassignedSection of unassignedSections) {
    if (unassignedSection.podcast !== undefined) {
      promises.push(
        new Promise((resolve, reject) => {
          return getDuration(unassignedSection.podcast).then( duration => {
            if (duration !== false) {
              const minutes = Math.floor(duration / 60);

              if (minutes < DURATION_MIN) {
                reject();
              } else {
                const endObj = moment(unassignedSection.date_time_start);
                endObj.add(minutes, 'minutes');
                unassignedSection.date_time_end = endObj.toISOString();


                if (unassignedSection.presenter !== undefined) {
                  unassignedSection.host = unassignedSection.presenter;
                  delete(unassignedSection.presenter);
                }

                // finalShows.push(unassignedSection);
                resolve(unassignedSection)
              }
            } else {
              reject();
            }
          });
        })
      );
    }
  }

  if (promises.length > 0) {
    return Promise.all(promises).then((values) => {
      return [...finalShows, ...values];
    })
    .catch(error => {
      // logger.log('error', error);
      return finalShows;
    });
  } else {
    return Promise.resolve(finalShows);
  }
};

const fetch = (dateObj, name, url) => {
  logger.log('info', `fetching ${url}`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .select('.emissions-thematique-content .block-fr3-content .content')
      .set({
        'img': '.image .asset-image img@src',
        'datetime_host': ['p'],
        'title': 'h3 a'
      })
      .do(
        osmosis.follow('.image a@href')
          .set({
            'description': ['.emission-description--header p'],
            'podcast': '.player-standard audio@src'
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

  // positive = after France so we need previous day + day
  // negative = before France so we need day + next day
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
