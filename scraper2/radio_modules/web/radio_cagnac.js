import moment from 'moment-timezone';
import logger from '../../lib/logger.js';

let scrapedData = [];

const format = async dateObj => {
  dateObj.tz('Europe/Paris');

  const cleanedData = scrapedData.reduce(function (prev, entry) {
    let regexp = new RegExp(/([0-9]{1,2})[:]([0-9]{1,2})/);
    let match = entry.datetime_raw.match(regexp);

    if (!match) {
      return prev;
    }

    const startDateTime = moment(dateObj);

    startDateTime.hour(match[1]);
    startDateTime.minute(match[2]);
    startDateTime.second(0);

    const newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'title': entry.title.trim(),
    };

    prev.push(newEntry);
    return prev;
  }, []);

  return Promise.resolve(cleanedData);
};

const fetch = async dateObj => {
  dateObj.locale('fr');
  let url = 'https://radiocagnac.fr/programmes.html';

  logger.log('info', `fetching ${url}`);

  // let's fake it for now
  // (it's currently an img)

  scrapedData.push(
    {
      datetime_raw: '00:00',
      title: 'Variété'
    },
    {
      datetime_raw: '05:00',
      title: 'Chansons de légende'
    },
    {
      datetime_raw: '10:00',
      title: 'Musette'
    },
    {
      datetime_raw: '11:00',
      title: 'Chansons de légende'
    },
    {
      datetime_raw: '14:00',
      title: 'Variété'
    },
    {
      datetime_raw: '21:00',
      title: 'Live Concerts'
    },
    {
      datetime_raw: '22:00',
      title: 'Variété'
    },
  )



  return Promise.resolve(true);
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
export default {
  getName: 'radio_cagnac',
  supportTomorrow: true,
  getScrap
};
