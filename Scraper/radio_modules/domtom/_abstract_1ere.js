const osmosis = require('osmosis');
const moment = require('moment-timezone');
const mm = require('music-metadata');
const logger = require('../../lib/logger.js');
const node_fetch = require('node-fetch');
const safeEval = require('safe-eval')

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

let descriptions = {};

const fetchPage = async (url) => {
  const fullUrl = 'https://la1ere.francetvinfo.fr' + url;

  logger.log('info', `fetching ${fullUrl}`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(fullUrl)
      .set({
        'json': ['script']
      })
      .data(function (listing) {
        descriptions[url] = listing;
      })
      .done(function () {
        resolve(true);
      })
  });
};

const fetchDescription = async (url) => {
  // prevent getting stuck sometimes when calling the same url
  if (descriptions[url]) {
    return descriptions[url];
  }

  await fetchPage(url);

  if (!descriptions[url]) {
    return null;
  }

  let content = null;
  let startIndex = null;
  let endIndex = null;

  for(let i=0;i<descriptions[url].json.length;i++) {
    startIndex = curr.json[i].indexOf('const data = [null,null,');

    if (startIndex === -1) {
      continue;
    }

    endIndex = curr.json[i].indexOf('}];');

    if (endIndex === -1) {
      continue;
    }

    content = safeEval(curr.json[i].substring(startIndex + 24, endIndex + 1));
  }

  if (!content) {
    return null;
  }

  if (content.data.page.content.description) {
    return cotentdata.page.content.description;
  }

  return null;
}

let scrapedData = {};
let cleanedData = {};

const format = async (dateObj, dayWanted, name) => {
  const dayWantedStart = moment(dayWanted);
  dayWantedStart.hour(0);
  dayWantedStart.minute(0);
  dayWantedStart.second(0);

  const dayWantedEnd = moment(dayWanted);
  dayWantedEnd.hour(23);
  dayWantedEnd.minute(59);
  dayWantedEnd.second(59);

  cleanedData[name] = {
    'shows': [],
    'sections': []
  };

  // we use reduce instead of map to act as a map+filter in one pass
  scrapedData[name].reduce(async function (prev, curr) {
    let content = null;
    let startIndex = null;
    let endIndex = null;

    for(let i=0;i<curr.json.length;i++) {
      startIndex = curr.json[i].indexOf('const data = [null,null,');

      if (startIndex === -1) {
        continue;
      }

      endIndex = curr.json[i].indexOf('}];');

      if (endIndex === -1) {
        continue;
      }

      content = safeEval(curr.json[i].substring(startIndex + 24, endIndex + 1));
    }

    if (!content) {
      return prev;
    }

    for (let category of content.data.page.blocks.podcasts) {
      for (let curr3 of category.children) {
        if (!curr3.subtitle) {
          continue;
        }

        let matchedDay = false;
        let match = null;
        const dayNum = dateObj.isoWeekday();

        // day range
        let regexp = new RegExp(/(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\sau\s(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)/);
        match = curr3.subtitle.toLowerCase().match(regexp);

        if (match !== null) {
          // not in day interval
          if (dayNum < dayFr[match[1]] || dayNum > dayFr[match[2]]) {
            continue;
          } else {
            matchedDay = true;
          }
        }

        // two days
        if (matchedDay === false) {
          regexp = new RegExp(/(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\set\s(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)/);
          match = curr3.subtitle.toLowerCase().match(regexp);

          if (match !== null) {
            // not one of days
            if (dayNum !== dayFr[match[1]] && dayNum !== dayFr[match[2]]) {
              continue;
            } else {
              matchedDay = true;
            }
          }
        }

        // one day
        if (matchedDay === false) {
          regexp = new RegExp(/(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)/);
          match = curr3.subtitle.toLowerCase().match(regexp);

          if (match !== null) {
            // not day
            if (dayNum !== dayFr[match[1]]) {
              continue;
            } else {
              matchedDay = true;
            }
          }
        }

        // everyday
        if (matchedDay === false) {
          if (curr3.subtitle.includes('ous les jours') === true) {
            matchedDay = true;
          }
        }

        if (matchedDay === false) {
          continue;
        }

        let isSection = false;
        let matchTime = null;

        // 14h à 16h00, getting the start
        regexp = new RegExp(/([0-9]{1,2})[h|H]([0-9]{0,2})\sà\s/);
        matchTime = curr3.subtitle.match(regexp);

        if (matchTime !== null) {
          if (matchTime.length === 2) {
            matchTime[2] = 0;
          }

          // getting the end
          regexp = new RegExp(/\sà\s([0-9]{1,2})[h|H]([0-9]{0,2})/);
          const matchTimeSupp = curr3.subtitle.match(regexp);

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
          matchTime = curr3.subtitle.match(regexp);

          if (matchTime !== null) {
            isSection = true;
            if (matchTime.length === 2) {
              matchTime[2] = 0;
            }
          }
        }

        if (matchTime === null) {
          continue;
        }

        const newEntry = {
          // img: curr3.visual.src,
          title: curr3.title,
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
        let matchHost = curr3.subtitle.match(regexp);

        if (matchHost !== null) {
          if (isSection === false) {
            newEntry.host = matchHost[1];
          } else {
            newEntry.presenter = matchHost[1];
          }
        } else {
          regexp = new RegExp(/Présenté par ([A-Za-z]*\s[A-Za-z]*)/);
          matchHost = curr3.subtitle.match(regexp);

          if (matchHost !== null) {
            if (isSection === false) {
              newEntry.host = matchHost[1];
            } else {
              newEntry.presenter = matchHost[1];
            }
          }
        }

        // can't make it work, fetching the url is getting stuck
/*        if (curr3.link.url) {
          try {
            const description = await fetchDescription(curr3.link.url);
            if (description) {
              newEntry.description = description;
            }
          } catch(error) {
            // nothing
          }
        }*/

        if (isSection === true) {
          delete newEntry.sections;
          cleanedData[name]['sections'].push(newEntry);
        } else {
          cleanedData[name]['shows'].push(newEntry);
        }
      }
    }
  }, []);

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
      .set({
        'json': ['script']
      })
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
