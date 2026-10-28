import axios from 'axios';
import * as cheerio from 'cheerio';
import moment from 'moment-timezone';
import logger from '../../lib/logger.js';

let jsonScrapedData = [];

// descriptions are html
const cleanDescription = description => {
  if (!description) {
    return null;
  }

  const text = cheerio.load(description).text().replace(/\s+/g, ' ').trim();

  return text !== '' ? text : null;
};

const format = async dateObj => {
  const dayStart = moment(dateObj).tz('Europe/Paris').startOf('day');
  const dayEnd = moment(dayStart).add(1, 'days');

  // without "from" the api lists the shows from the current one onwards, an incomplete day
  // would replace the full schedule imported the day before
  if (jsonScrapedData.length === 0 || moment(jsonScrapedData[0].startTime).isAfter(dayStart)) {
    logger.log('info', `radio_montblanc - ${dayStart.format('DD-MM-YYYY')} is not complete, skipped`);
    return Promise.resolve([]);
  }

  const cleanedData = jsonScrapedData.reduce(function (prev, entry) {
    if (!entry.startTime || !entry.endTime || !entry.title) {
      return prev;
    }

    const startDateTime = moment(entry.startTime);
    const endDateTime = moment(entry.endTime);

    // shows starting that day, the one after midnight is part of the day before
    if (startDateTime.isBefore(dayStart) || startDateTime.isSameOrAfter(dayEnd)) {
      return prev;
    }

    prev.push({
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString(),
      'title': entry.title.trim(),
      'img': entry.imageUrl ? entry.imageUrl : null,
      'description': cleanDescription(entry.description)
    });

    return prev;
  }, []);

  return Promise.resolve(cleanedData);
};

const fetch = async dateObj => {
  // "from" returns 7 days starting at midnight (including the show still on air at midnight),
  // "to" is not supported
  const day = moment(dateObj).tz('Europe/Paris').format('YYYY-MM-DD');
  const url = `https://radiomontblanc.fr/api/radio/programmes?from=${day}`;

  logger.log('info', `fetching ${url}`);

  const response = await axios.get(url);
  jsonScrapedData = Array.isArray(response.data) ? response.data : [];

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
  getName: 'radio_montblanc',
  supportTomorrow: true,
  getScrap
};
