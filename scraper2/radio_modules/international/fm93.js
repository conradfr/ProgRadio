import moment from 'moment-timezone';
import logger from '../../lib/logger.js';
import utils from '../../lib/utils.js';
import axios from 'axios';
import { convert } from 'html-to-text';

let scrapedData = [];

const format = dateObj => {
  const startDateTime = moment(dateObj);
  startDateTime.hour(0);
  startDateTime.minute(0);
  startDateTime.second(0);
  startDateTime.millisecond(0);

  const endDateTime = moment(dateObj);
  endDateTime.hour(23);
  endDateTime.minute(59);
  endDateTime.second(59);
  endDateTime.millisecond(0);

  // we use reduce instead of map to act as a map+filter in one pass
  const cleanedData = scrapedData.reduce(function (prev, curr) {
    const currStartDateTime = moment.tz(curr.trueschedule[0].begin, 'America/Montreal');

    if (currStartDateTime.isBetween(startDateTime, endDateTime, 'seconds', '[]') === false) {
      return prev;
    }

    const currEndDateTime = moment.tz(curr.trueschedule[0].end, 'America/Montreal');

    const newEntry = {
      'date_time_start': currStartDateTime.toISOString(),
      'date_time_end': currEndDateTime.toISOString(),
      'title': curr.name
    };

    if (curr.description !== undefined && curr.description !== null) {
      newEntry.description = convert(curr.description, {
        wordwrap: false
      });
    }

    if (utils.checkNested(curr, 'images', 'profile', 'ori') === true) {
      newEntry.img = curr.images.profile.ori;
    }

    if (utils.checkNested(curr, 'users', 'ANIMATOR') === true) {
      const hosts = [];
      curr.users.ANIMATOR.forEach(function (entry) {
        const host = [];
        if (entry.firstName !== undefined && entry.firstName !== null) {
          host.push(entry.firstName);
        }

        if (entry.lastName !== undefined && entry.lastName !== null) {
          host.push(entry.lastName);
        }

        hosts.push(host.join(' '));
      });

      if (hosts.length > 0) {
        newEntry.host = hosts.join(', ');
      }
    }

    prev.push(newEntry);
    return prev;
  }, []);

  return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
  dateObj.locale('fr');
  const format = 'YYYY-MM-DD';

  // const url = `https://api.cogecolive.com/shows/queue?stationId=6&with=images,users,trueschedule&timeAsked=${dateObj.format(format)}`;
  const url = `https://api.cogecolive.com/shows?stationId=6&dateFrom=${dateObj.format(format)}%2000:00:00&dateTo=${dateObj.format(format)}%2023:59:00&with=images,shows,trueschedule,users,stations`;

  logger.log('info', `fetching ${url}`);

  return axios.get(url)
    .then(function (response) {
      scrapedData = [...scrapedData, ...response.data.shows];
      return resolve(true);
    }).catch(() => resolve(true));
};

const fetchAll = dateObj => {
  const previousDay = moment(dateObj);
  previousDay.subtract(1, 'days');

  return fetch(previousDay)
    .then(() => {
      return fetch(dateObj);
    }).catch(() => fetch(dateObj));
};

const getScrap = dateObj => {
  return fetchAll(dateObj)
    .then(() => {
      return format(dateObj);
    }).catch(() => format(dateObj));
};

export default {
    getName: 'fm93',
    supportTomorrow: true,
    getScrap
};