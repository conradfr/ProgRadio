const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');

let scrapedData = [];

const dayFr = {
  'lundi': 1,
  'mardi': 2,
  'mercredi': 3,
  'jeudi': 4,
  'vendredi': 5,
  'samedi': 6,
  'dimanche': 7
};

const format = dateObj => {
  dateObj.tz("Europe/Paris");
  dateObj.locale('fr');

  const mains = [];
  const sections = [];

  scrapedData.forEach(function(curr) {
    if (typeof curr.json === 'undefined') {
      return;
    }
    const content = JSON.parse(curr.json.substr(20));

    let newEntry = {
      'title': content.contentReducer.title,
      'timezone': 'Europe/Paris',
      'img': content.contentReducer.visual.url
    };

    if (content.contentReducer.body !== null) {
      newEntry.description = content.contentReducer.body.children[0].children[0].value;
    }

    let matched = false;
    let match_time = null;

    const datetime_raw = content.contentReducer.airtime;

    if (datetime_raw === null || typeof datetime_raw === 'undefined') {
      return;
    }

    let regexp = new RegExp(/^Du\s(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\sau\s(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)/);
    let match = datetime_raw.match(regexp);

    if (match !== null) {
      if (dateObj.isoWeekday() >= dayFr[match[1]] && dateObj.isoWeekday() <= dayFr[match[2]]) {
        matched = true;
      }
    }

    if (matched === false) {
      regexp = new RegExp(/^Le\s(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\set\s(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)/);
      match = datetime_raw.match(regexp);

      if (match !== null) {
        if (dateObj.isoWeekday() >= dayFr[match[1]] && dateObj.isoWeekday() <= dayFr[match[2]]) {
          matched = true;
        }
      }
    }

    if (matched === false) {
      regexp = new RegExp(/^Le\s(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)/);
      match = datetime_raw.match(regexp);

      if (match !== null) {
        if (dateObj.isoWeekday() === dayFr[match[1]]) {
          matched = true;
        }
      }
    }

    if (matched === false) {
      return;
    }

    let startDateTime = null;
    let endDateTime = null;

    regexp = new RegExp(/([0-9]{1,2})[h|H]([0-9]{0,2})( à ((([0-9]{1,2})[h|H]([0-9]{0,2}))|minuit)){0,1}/);
    match_time = datetime_raw.match(regexp);

    if (match_time !== null) {
      startDateTime = moment(dateObj);
      startDateTime.hour(match_time[1]);
      startDateTime.minute(match_time[2] || 0);
      startDateTime.second(0);

      if (match_time[3] !== undefined) {
        endDateTime = moment(dateObj);
        if (match_time[4] === 'minuit') {
          endDateTime.hour(0);
          endDateTime.minute(0);
          endDateTime.add(1, 'days');
        } else {
          endDateTime.hour(match_time[6]);
          endDateTime.minute(match_time[7] || 0);
        }
        endDateTime.second(0);
      }

      newEntry.date_time_start = startDateTime.toISOString();

      if (endDateTime !== null) {
        newEntry.date_time_end = endDateTime.toISOString();
        newEntry.sections = [];
      }
    }
    // no start datetime
    else {
      return;
    }

    if (typeof newEntry.sections === 'undefined') {
      sections.push(newEntry);
    } else {
      mains.push(newEntry)
    }
  });

    // put sections in main
    if (sections.length > 0) {
      // sort mains
      function compare(a,b) {
        momentA = moment(a.date_time_start);
        momentB = moment(b.date_time_start);

        if (momentA.isBefore(momentB))
          return -1;
        if (momentA.isAfter(momentB))
          return 1;
        return 0;
      }

      mains.sort(compare);

      sections.forEach(function(entry) {
        for (i=0;i<mains.length;i++){
          entryMoment = moment(entry.date_time_start);
          mainMoment = moment(mains[i].date_time_start);

          let toAdd = false;
          if (i === (mains.length - 1)) {
            if (entryMoment.isAfter(mainMoment)) {
              toAdd = true;
            }
          }
          else if (entryMoment.isBetween(mainMoment, moment(mains[i + 1].date_time_start))) {
            toAdd = true;
          }

          if (toAdd === true) {
            mains[i].sections.push(entry);
            break;
          }
        }
      });
    }

    return Promise.resolve(mains);
};

const fetch = dateObj => {
    dateObj.locale('fr');
    let url = `https://www.mouv.fr/emissions`;

    logger.log('info', `fetching ${url}`);

    return new Promise(function(resolve, reject) {
        return osmosis
          .get(url)
          .select('.concepts-list-block-container > a')
            .set({'test': '@href'})
          .do(
            osmosis.follow('@href')
              .find('body')
              .set({
                'json': 'script[1]',
                'test2': 'script[0]'
              })
/*              .set({
                'img': '.banner-image > .banner-image-visual@src',
              })
              .find('.concept-main-container-content')
              .set({
                'title': 'h1',
                'datetime_raw': '.concept-main-container-content-airtime',
                'description': '.content > p'
              })*/
          )
            .data(function (listing) {
                scrapedData.push(listing);
            })
            .done(function () {
                resolve(true);
            })
    });
};

const fetchAll = dateObj =>  {
    return fetch(dateObj);
};

const getScrap = dateObj => {
    return fetchAll(dateObj)
        .then(() => {
            return format(dateObj);
        });
};

const scrapModule = {
    getName: 'mouv',
    getScrap
};

module.exports = scrapModule;
