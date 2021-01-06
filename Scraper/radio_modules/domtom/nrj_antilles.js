const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');

const dayFr = {
  'lundi': 1,
  'mardi': 2,
  'mercredi': 3,
  'jeudi': 4,
  'vendredi': 5,
  'samedi': 6,
  'dimanche': 7
};

let scrapedData = [];

// gonna be messy
const format = dateObj => {
  // const dayNum = dateObj.isoWeekday();

  // we use reduce instead of map to act as a map+filter in one pass
  const cleanedData = scrapedData.reduce(function (prev, curr, index, array) {
    const dayNum = curr.dateObj.isoWeekday();

    const description = curr.description !== undefined && curr.description !== null
      && (typeof curr.description === 'object' && Array.isArray(curr.description))
      ? curr.description.join(' ') : curr.description_short;

    const newEntry = {
      'img': curr.img,
      'title': curr.title.trim(),
      'description': description

    };

    let matchDone = false;

    // -------------------------------------------------- TYPE 1 --------------------------------------------------

    let matchTime = null;
    let regexp = new RegExp(/(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\sau\s(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)/);
    match = description.toLowerCase().match(regexp);

    if (match !== null) {
      matchDone = true;

      // not in day interval
      if (dayNum < dayFr[match[1]] || dayNum > dayFr[match[2]]) {
        return prev;
      } else {
        regexp = new RegExp(/d[é|è]s ([0-9]{1,2})[h|H]([0-9]{0,2})/);
        matchTime = description.toLowerCase().match(regexp);

        if (matchTime !== null) {
          const startDateTime = moment(curr.dateObj);
          startDateTime.hour(matchTime[1]);
          startDateTime.second(0);

          if (matchTime.length === 2) {
            startDateTime.minute(0);
          } else {
            startDateTime.minute(matchTime[2]);
          }

          newEntry.date_time_start = startDateTime.toISOString();

          // try to find the end
          regexp = new RegExp(/usqu['|’]à ([0-9]{1,2}|minuit)[h|H]{0,1}([0-9]{0,2})/);
          matchTime = description.toLowerCase().match(regexp);

          if (matchTime !== null) {
            const endDateTime = moment(curr.dateObj);
            endDateTime.hour(matchTime[1] === 'minuit' ? 0 : matchTime[1]);
            endDateTime.second(0);

            if (matchTime.length === 2) {
              endDateTime.minute(0);
            } else {
              endDateTime.minute(matchTime[2]);
            }

            newEntry.date_time_end = endDateTime.toISOString();
          }
        } else {
          return prev;
        }
      }
    }

    // -------------------------------------------------- TYPE 2 --------------------------------------------------

    if (matchDone === false ) {
      if (description.includes('Chaque matin') === true || description.includes('ous les jours')) {
        matchDone = true;

        if (dayNum < dayFr['lundi'] || dayNum > dayFr['vendredi']) {
          return prev;
        }

        //very dirty
        if (curr.title === 'La DRIVE avec RENAUD') {
          matchTime = [
            'empty',
            16,
            0
          ]
        } else {
          regexp = new RegExp(/(?:d[é|è]s|à partir de) ([0-9]{1,2})[h|H]([0-9]{0,2})/);
          matchTime = description.toLowerCase().match(regexp);
        }

        if (matchTime !== null) {
          const startDateTime = moment(curr.dateObj);
          startDateTime.hour(matchTime[1]);
          startDateTime.second(0);

          if (matchTime.length === 2) {
            startDateTime.minute(0);
          } else {
            startDateTime.minute(matchTime[2]);
          }

          newEntry.date_time_start = startDateTime.toISOString();

          // try to find the end
          regexp = new RegExp(/usqu['|’]à ([0-9]{1,2}|minuit)[h|H]{0,1}([0-9]{0,2})/);
          matchTime = description.toLowerCase().match(regexp);

          if (matchTime !== null) {
            const endDateTime = moment(curr.dateObj);
            endDateTime.hour(matchTime[1] === 'minuit' ? 0 : matchTime[1]);
            endDateTime.second(0);

            if (matchTime.length === 2) {
              endDateTime.minute(0);
            } else {
              endDateTime.minute(matchTime[2]);
            }

            newEntry.date_time_end = endDateTime.toISOString();
          }
        } else {
          return prev;
        }
      }
    }

    // -------------------------------------------------- TYPE 3 --------------------------------------------------

    if (matchDone === false ) {
      regexp = new RegExp(/Le (lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)/);
      match = description.toLowerCase().match(regexp);

      if (match !== null) {
        matchDone = true;

        if (dayNum !== dayFr[match[1]]) {
          return prev;
        } else {
          regexp = new RegExp(/d[é|è]s ([0-9]{1,2})[h|H]([0-9]{0,2})/);
          matchTime = description.toLowerCase().match(regexp);

          if (matchTime !== null) {
            const startDateTime = moment(curr.dateObj);
            startDateTime.hour(matchTime[1]);
            startDateTime.second(0);

            if (matchTime.length === 2) {
              startDateTime.minute(0);
            } else {
              startDateTime.minute(matchTime[2]);
            }

            newEntry.date_time_start = startDateTime.toISOString();

            // try to find the end
            regexp = new RegExp(/usqu['|’]à ([0-9]{1,2}|minuit)[h|H]{0,1}([0-9]{0,2})/);
            matchTime = description.toLowerCase().match(regexp);

            if (matchTime !== null) {
              const endDateTime = moment(curr.dateObj);
              endDateTime.hour(matchTime[1] === 'minuit' ? 0 : matchTime[1]);
              endDateTime.second(0);

              if (matchTime.length === 2) {
                endDateTime.minute(0);
              } else {
                endDateTime.minute(matchTime[2]);
              }

              newEntry.date_time_end = endDateTime.toISOString();
            }
          } else {
            return prev;
          }
        }
      }
    }

    // -------------------------------------------------- TYPE 4 --------------------------------------------------

    if (matchDone === false ) {
      regexp = new RegExp(/ous les (lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)/);
      match = description.toLowerCase().match(regexp);

      // possible multiple
      if (match !== null) {
        matchDone = true;
        let isDay = false;
        let isDayIndex = null;
        for (let [index, day] of match) {
          if (index === 0) {
            continue;
          }

          if (dayNum === dayFr[match[1]]) {
            isDay = true;
            isDayIndex = index;
            break;
          }
        }

        if (isDay === false ) {
          return prev;
        } else {
          regexp = new RegExp(/d[é|è]s ([0-9]{1,2})[h|H]([0-9]{0,2})/);
          matchTime = description.toLowerCase().match(regexp);

          if (matchTime !== null) {
            const startDateTime = moment(curr.dateObj);
            startDateTime.hour(matchTime[1]);
            startDateTime.second(0);

            if (matchTime.length === 2) {
              startDateTime.minute(0);
            } else {
              startDateTime.minute(matchTime[2]);
            }

            newEntry.date_time_start = startDateTime.toISOString();

            // try to find the end
            regexp = new RegExp(/usqu['|’]à ([0-9]{1,2}|minuit)[h|H]{0,1}([0-9]{0,2})/);
            matchTime = description.toLowerCase().match(regexp);

            if (matchTime !== null) {
              const endDateTime = moment(curr.dateObj);
              endDateTime.hour(matchTime[1] === 'minuit' ? 0 : matchTime[1]);
              endDateTime.second(0);

              if (matchTime.length === 2) {
                endDateTime.minute(0);
              } else {
                endDateTime.minute(matchTime[2]);
              }

              newEntry.date_time_end = endDateTime.toISOString();
            }
          } else {
            return prev;
          }
        }
      }
    }

    // dirty thing, oh well ...
    if (matchDone === false) {
      regexp = new RegExp(/de ([0-9]{1,2})[h|H]([0-9]{0,2}) jusqu/);
      matchTime = description.toLowerCase().match(regexp);

      if (matchTime !== null) {
        const startDateTime = moment(curr.dateObj);
        startDateTime.hour(matchTime[1]);
        startDateTime.second(0);

        if (matchTime.length === 2) {
          startDateTime.minute(0);
        } else {
          startDateTime.minute(matchTime[2]);
        }

        // try to find the end
        regexp = new RegExp(/usqu['|’]à ([0-9]{1,2}|minuit)[h|H]{0,1}([0-9]{0,2})/);
        matchTime = description.toLowerCase().match(regexp);

        let endDateTime = null;
        if (matchTime !== null) {
          endDateTime = moment(curr.dateObj);
          endDateTime.hour(matchTime[1] === 'minuit' ? 0 : matchTime[1]);
          endDateTime.second(0);

          if (matchTime.length === 2) {
            endDateTime.minute(0);
          } else {
            endDateTime.minute(matchTime[2]);
          }
        }

        if (dayNum >= dayFr['lundi'] && dayNum <= dayFr['vendredi']) {
          matchDone = true;
          newEntry.date_time_start = startDateTime.toISOString();
          if (endDateTime !== null) {
            newEntry.date_time_end = endDateTime.toISOString();
          }
        }
      } else {
        return prev;
      }
    }

    // even more dirty
    if (matchDone === false && curr.title === 'La DRIVE avec RENAUD'
      && (dayNum >= dayFr['lundi'] && dayNum <= dayFr['vendredi'])) {
      matchDone = true;
      const startDateTime = moment(curr.dateObj);
      startDateTime.hour(16);
      startDateTime.minute(0);
      startDateTime.second(0);

      // try to find the end
      regexp = new RegExp(/usqu['|’]à ([0-9]{1,2}|minuit)[h|H]{0,1}([0-9]{0,2})/);
      matchTime = description.toLowerCase().match(regexp);

      let endDateTime = null;
      if (matchTime !== null) {
        endDateTime = moment(curr.dateObj);
        endDateTime.hour(matchTime[1] === 'minuit' ? 0 : matchTime[1]);
        endDateTime.second(0);

        if (matchTime.length === 2) {
          endDateTime.minute(0);
        } else {
          endDateTime.minute(matchTime[2]);
        }
      }

      newEntry.date_time_start = startDateTime.toISOString();
      if (endDateTime !== null) {
        newEntry.date_time_end = endDateTime.toISOString();
      }
    }

    if (matchDone === false) {
      return prev;
    }

    prev.push(newEntry);
    return prev;
  }, []);

  // remove wrong day
  const finalShows = [];

  const dayWantedStart = moment(dateObj);
  dayWantedStart.hour(0);
  dayWantedStart.minute(0);
  dayWantedStart.second(0);

  const dayWantedEnd = moment(dateObj);
  dayWantedEnd.hour(23);
  dayWantedEnd.minute(59);
  dayWantedEnd.second(59);

  for (let [index, show] of cleanedData.entries()) {
    if (moment(show.date_time_start).isBetween(dayWantedStart, dayWantedEnd) === true) {
      finalShows.push(show);
    }
  }

  console.log(finalShows);

  return Promise.resolve(finalShows);
};

const fetch = dateObj => {
  dateObj.locale('fr');
  let url = 'https://nrjantilles.com/category/radio/agenda-nrj/';

  logger.log('info', `fetching ${url}`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .select(`.mkd-pt-one-item.mkd-post-item`)
      .set({
        'img': 'img.wp-post-image@src',
        'title': '.mkd-pt-one-title a',
        'description_short': '.mkd-post-excerpt'
      })
      .do(
        osmosis.follow('.mkd-pt-one-title a@href')
          .set({
            'description': ['.mkd-post-text-inner p']
          })
      )
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
  const otherDayObj = moment(dateObj) ;
  otherDayObj.subtract(1, 'days');

  return fetch(otherDayObj)
    .then(() => {
      return fetch(dateObj);
    });
};

const getScrap = dateObj => {
  dateObj.tz('America/Martinique');

  return fetchAll(dateObj)
    .then(() => {
      return format(dateObj);
    });
};

const scrapModule = {
  getName: 'nrj_antilles',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
