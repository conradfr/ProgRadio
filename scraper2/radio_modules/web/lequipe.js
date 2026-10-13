import axios from 'axios';
import moment from 'moment-timezone';
import logger from '../../lib/logger.js';

const formatStr = 'YYYYMMDD';
// images are 3:2, the size is set in the url
const imgWidth = 600;
const imgHeight = 400;
let scrapedData = {};

const format = async dateObj => {
  dateObj.tz('Europe/Paris');
  const dateStr = dateObj.format(formatStr);

  const previousDay = moment(dateObj);
  previousDay.subtract(1, 'days');
  const previousDateStr = previousDay.format(formatStr);

  // a day grid goes from 6am to 6am, so the night of the day is in the grid of the previous day
  const entries = [...(scrapedData[previousDateStr] || []), ...(scrapedData[dateStr] || [])];

  const cleanedData = [];

  for (const entry of entries) {
    if (!entry.title) {
      continue;
    }

    const startDateTime = moment.tz(entry.date, 'Europe/Paris');
    const endDateTime = moment.tz(entry.end_date, 'Europe/Paris');

    // keep only what starts on the day (midnight to midnight in the radio timezone)
    if (!startDateTime.isSame(dateObj, 'day')) {
      continue;
    }

    const newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString(),
      'title': entry.title.trim(),
      'img': entry.image_url ? entry.image_url.replace('{width}', imgWidth).replace('{height}', imgHeight) : null
    };

    cleanedData.push(newEntry);
  }

  return Promise.resolve(cleanedData);
};

const fetch = async dateObj => {
  dateObj.locale('fr');
  const dateStr = dateObj.format(formatStr)
  const url = `https://dwh.lequipe.fr/api/efr/tvschedule/grid/${dateStr}`;

  logger.log('info', `fetching ${url}`);

  const response = await axios.get(url);

  if (!response || !response.data || !response.data.items) {
    return Promise.resolve(true);
  }

  scrapedData[dateStr] = response.data.items.filter(entry => entry.channel_slug === 'la-chaine-l-equipe');

  return Promise.resolve(true);
};

const fetchAll = dateObj => {
  dateObj.tz('Europe/Paris');

  /* the grid of a day has the format 6am -> 6am,
     so we get the previous day as well to have the night and filter the list later */
  const previousDay = moment(dateObj);
  previousDay.subtract(1, 'days');

  return fetch(previousDay)
    .then(() => {
      return fetch(dateObj);
    });
};

const getScrap = dateObj => {
  scrapedData = {};
  return fetchAll(dateObj)
    .then(() => {
      return format(dateObj);
    });
};
export default {
  getName: 'lequipe',
  supportTomorrow: true,
  getScrap
};
