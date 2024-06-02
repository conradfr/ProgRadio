const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');
const utils = require('../../lib/utils.js');

let scrapedData = [];
let  cleanedData = [];

const dayFr = {
  'Lundi': 1,
  'Mardi': 2,
  'Mercredi': 3,
  'Jeudi': 4,
  'Vendredi': 5,
  'Samedi': 6,
  'Dimanche': 7
};

const dayNameFr = {
  'Lundi': 1,
  'Mardi': 2,
  'Mercredi': 3,
  'Jeudi': 4,
  'Vendredi': 5,
  'Samedi': 6,
  'Dimanche': 7
};

const format = (dateObj) => {

  console.log(scrapedData);

  dateObj.tz('Europe/Paris');
  dateObj.locale('fr');

  cleanedData[subRadio] = scrapedData[subRadio].reduce(function (prev, entry) {
    let time = [];

    let regexp = new RegExp(/^Du\s(Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi|Dimanche)\sau\s(Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi|Dimanche), de ([0-9]{1,2})[:]([0-9]{2})\sà\s([0-9]{1,2})[:]([0-9]{2})/);
    let match = entry.datetime_raw.match(regexp);

    if (match === null) {
      // maybe it's weekend
      regexp = new RegExp(/^Le week-end, de ([0-9]{1,2})[:]([0-9]{2})\sà\s([0-9]{1,2})[:]([0-9]{2})/);
      match = entry.datetime_raw.match(regexp);

      if (match !== null) {
        // not week-end ?
        const dayNum = dateObj.isoWeekday();
        if (dayNum !== 6 && dayNum !== 7) {
          return prev;
        }

        time = [match[1], match[2], match[3], match[4]];
      }
    } else {
      // not in day interval
      const dayNum = dateObj.isoWeekday();
      if (dayNum < dayFr[match[1]] || dayNum > dayFr[match[2]]) {
        return prev;
      }

      time = [match[3], match[4], match[5], match[6]];
    }

    // maybe it's just one day
    if (match === null) {
      regexp = new RegExp(/^(Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi|Dimanche)(.*), de ([0-9]{1,2})[:]([0-9]{2})\sà\s([0-9]{1,2})[:]([0-9]{2})/);
      match = entry.datetime_raw.match(regexp);

      if (match === null) {
        return prev;
      }

      const dayName = utils.upperCaseWords(dateObj.format('dddd'));
      if (match[0].indexOf(dayName) !== -1) {
        return prev;
      }

      time = [match[3], match[4], match[5], match[6]];
    }

    let startDateTime = moment(dateObj);
    startDateTime.hour(time[0]);
    startDateTime.minute(time[1]);
    startDateTime.second(0);

    endDateTime = moment(dateObj);
    endDateTime.hour(time[2]);
    endDateTime.minute(time[3]);
    endDateTime.second(0);

    // end at midnight etc
    if (time[2] < time[0]) {
      endDateTime.add(1, 'days');
    }

    const newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString(),
      'img': `https://www.radiooxygene.fr${entry.img}`,
      'title': entry.title,
      'host': entry.host.join(', '),
      'description': entry.description.join(' '),
    };

    prev.push(newEntry);
    return prev;
  }, []);

  return Promise.resolve(cleanedData[subRadio]);
};

const fetch = (dateObj) => {
  const url = 'https://www.radiosaintnabor.org/index.php/programmes';

  logger.log('info', `fetching ${url}`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .select('table.tab_programmes tbody tr')
      .set(
        {
          day: 'td[1]',
          hour2: 'td[2]',
          hour2_elems: ['td[2] span'],
          hour2_host: 'td[2] .animateur',
          hour2_title: 'td[2] .animation',
          hour3: 'td[3]',
          hour3_elems: ['td[3] span'],
          hour3_host: 'td[3] .animateur',
          hour3_title: 'td[3] .animation',
          hour4: 'td[4]',
          hour4_elems: ['td[4] span'],
          hour4_host: 'td[4] .animateur',
          hour4_title: 'td[4] .animation',
          hour5: 'td[5]',
          hour5_elems: ['td[5] span'],
          hour5_host: 'td[5] .animateur',
          hour5_title: 'td[5] .animation',
          hour6: 'td[6]',
          hour6_elems: ['td[6] span'],
          hour6_host: 'td[6] .animateur',
          hour6_title: 'td[6] .animation',
          hour7: 'td[7]',
          hour7_elems: ['td[7] span'],
          hour7_host: 'td[7] .animateur',
          hour7_title: 'td[7] .animation',
        }
      )
      .data(function (listing) {
        scrapedData.push(listing);
      })
      .done(function () {
        resolve(true);
      })
  });
};

const fetchAll = (dateObj) => {
  return fetch(dateObj);
};

const getScrap = (dateObj) => {
  return fetchAll(dateObj)
    .then(() => {
      return format(dateObj);
    });
};

const scrapModule = {
  getName: 'oxygene',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
