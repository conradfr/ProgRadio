const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');

let scrapedData = [];

const format = dateObj => {
  const mains = [];
  const sections = [];
  let referenceIndex = 0;
  let referenceIndexPrev = 0;

  scrapedData.reduce(function (prev, curr, index, array) {
    let startDateTime = moment(curr.dateObj);

    regexp = new RegExp(/([0-9]{1,2})h([0-9]{2})/);
    match_time = curr.time.match(regexp);

    if (match_time !== null) {
      startDateTime.hour(match_time[1]);
      startDateTime.minute(match_time[2]);
      startDateTime.second(0);
    } else {
      return prev;
    }

    let prevMatch = null;
    // keep only relevant time from previous day page
    if (startDateTime.isBefore(dateObj, 'day')) {
      if (referenceIndexPrev === 0 && (curr.description == null || curr.description.indexOf('rediffusion') === -1)) {
        referenceIndexPrev = index;
        return prev;
      }

      prevMatch = array[referenceIndexPrev].time.match(regexp);
      array[referenceIndexPrev].dateObj.hour(prevMatch[1]);

      if (array[referenceIndexPrev].dateObj.isBefore(startDateTime)) {
        return prev;
      }

      // update day
      startDateTime.add(1, 'days');
      // endDateTime.add(1, 'days');
    }
    // remove next day schedule from day page
    else {
      if (curr.main === true && curr.dateObj !== array[index - 1].dateObj && (curr.description == null || curr.description.indexOf('rediffusion') === -1)) {
        referenceIndex = index;
      } else {
        prevMatch = array[referenceIndex].time.match(regexp);
        let prevDate = moment(array[referenceIndex].dateObj);
        prevDate.hour(prevMatch[1]);

        if (prevDate.isAfter(startDateTime)) {
          return prev;
        }
      }

      // if (startDateTime.hour() > endDateTime.hour()) {
      //   endDateTime.add(1, 'days');
      // }
    }

    // It seems some rerun are given their original airtime (??) so we can't use them
    if (curr.description !== undefined && curr.description.indexOf('rediffusion') !== -1 && match_time[1] > 4) {
      return prev;
    }

    newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'img': curr.img,
      'title': curr.title,
      'description': curr.description !== undefined ? curr.description : null,
    };

    if (curr.main === true) {
      if (curr.host !== undefined && curr.host !== null && curr.host.length > 0){
        newEntry.host = curr.host;
      }

      newEntry.sections = [];
      mains.push(newEntry);
    } else {
      if (curr.host !== undefined && curr.host !== null && curr.host.length > 0){
        newEntry.presenter = curr.host.map(host => host.replace(', ', ''));
      }
      sections.push(newEntry);
    }

    return prev;
  });

  if (sections.length > 0) {
    // sort mains
    function compare(a, b) {
      momentA = moment(a.date_time_start);
      momentB = moment(b.date_time_start);

      if (momentA.isBefore(momentB))
        return -1;
      if (momentA.isAfter(momentB))
        return 1;
      return 0;
    }

    mains.sort(compare);

    sections.forEach(function (entry) {
      for (i = 0; i < mains.length; i++) {
        entryMoment = moment(entry.date_time_start);
        mainMoment = moment(mains[i].date_time_start);

        let toAdd = false;
        if (i === (mains.length - 1)) {
          if (entryMoment.isAfter(mainMoment)) {
            toAdd = true;
          }
        } else if (entryMoment.isBetween(mainMoment, moment(mains[i + 1].date_time_start))) {
          toAdd = true;
        }

        if (toAdd === true) {
          mains[i].sections.push(entry);
          break;
        }
      }
    });
  }

  // fuuu
  const mainsCleaned = mains.map(entry => {
    if (entry.host === undefined) {
      entry.sections = entry.sections.map(section => {
        if (section.presenter !== undefined && section.presenter !== null) {
          hostsSections = hostsSections.concat(section.presenter);
          section.presenter = section.presenter.join(', ');
        }
        return section;
      });

      return entry;
    }

    // couldn't find a way to not get all sections hosts in main so dedup here

    let hosts = [];

    if (entry.host !== undefined && entry.host !== null) {
      hosts = entry.host.map(host => host.replace(',', ''));
    }

    let hostsSections = [];

    let sectionsCleaned = entry.sections.map(section => {
      if (section.presenter !== undefined && section.presenter !== null) {
        hostsSections = hostsSections.concat(section.presenter);
        section.presenter = section.presenter.join(', ');
      }

      return section;
    });

    let index;
    for (let i=0; i<hostsSections.length; i++) {
      index = hosts.indexOf(hostsSections[i]);
      if (index > -1) {
        hosts.splice(index, 1);
      }
    }

    if (hosts.length > 0) {
      entry.host = [...new Set(hosts)].join(', ');
    } else {
      entry.host = null;
    }

    entry.sections = sectionsCleaned;
    return entry;
  });

  // console.log(mainsCleaned);

  return Promise.resolve(mainsCleaned);
};

const fetch = (dayFormat, sections, dateObj) => {
  let url = `https://www.franceinter.fr/programmes${dayFormat}`;

  logger.log('info', `fetching ${url}`);

  let findClass = ' > .card-elements > li.tile';

  if (sections === true) {
    findClass = '.card-elements-sub' + findClass;
  } else {
    findClass = '.card-elements-wrapper' + findClass;
  }

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .find(findClass)
      .set({
        'time': '.card-schedule',
        'img': '.dejavu@data-dejavu-src',
        'title': 'a.card-text-title',
        'description': 'a.card-text-sub',
        'host': ['.card-text-grey > a.card-text-grey']
      })
      .data(function (listing) {
        listing.main = sections !== true;
        listing.dateObj = dateObj;
        scrapedData.push(listing);
      })
      .done(function () {
        resolve(true);
      })
  });
};

const fetchAll = dateObj => {
  /* radio schedule page has the format 3am -> 3am,
      so we get the previous day as well to get the full day and the filter the list later  */

/*  const now = new moment();
  now.tz('Europe/Paris');

  if (now.hour() < 5) {
    return fetch('');
  }*/

  const previousDay = moment(dateObj);
  previousDay.subtract(1, 'days');

  return fetch('/' + previousDay.format('YYYY-MM-DD'), false, previousDay)
    .then(() => {
      // return fetch('/' + previousDay.format('YYYY-MM-DD'), true, previousDay)
      //   .then(() => {
          return fetch('/' + dateObj.format('YYYY-MM-DD'), false, dateObj)
            .then(() => {
              return fetch('/' + dateObj.format('YYYY-MM-DD'), true, dateObj)
            })
        // })
    });
};

const getScrap = dateObj => {
  return fetchAll(dateObj)
    .then(() => {
      return format(dateObj);
    });
};

const scrapModule = {
  getName: 'franceinter',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
