import axios from 'axios';
import moment from 'moment-timezone';
import logger from '../../lib/logger.js';

let scrapedData = [];

const format = async dateObj => {
  dateObj.tz('Europe/Paris');

  const cleanedData = scrapedData.reduce(function (prev, entry) {
    const startDateTime = moment.unix(entry.debut / 1000).utc();
    const endDateTime = moment.unix(entry.fin / 1000).utc();

    const isToday = dateObj.isSame(startDateTime, 'day');

    if (!isToday || (!entry.nom && !entry.title)) {
      return prev;
    }

    const newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString(),
      'title': entry.nom || entry.title,
      'img': entry.image || null,
      'host': entry.presentateur  && entry.presentateur != '' ? entry.presentateur : null,
      'description': entry.description || null,
    };

    prev.push(newEntry);
    return prev;
  }, []);

  return Promise.resolve(cleanedData);
};

const fetch = async dateObj => {
  const url = 'https://rmc.bfmtv.com/api/v1/epg/epg-rmc/';
  dateObj.locale('fr');

  logger.log('info', `fetching ${url}`);

  const response = await axios.get(url);

  if (response.data && response.data.data && response.data.data.programmes) {
    scrapedData = response.data.data.programmes;
  }

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
  getName: 'rmc',
  supportTomorrow: true,
  getScrap
};
