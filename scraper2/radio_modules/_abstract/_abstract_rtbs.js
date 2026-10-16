import axios from 'axios';
import moment from 'moment-timezone';
import logger from '../../lib/logger.js';

let scrapedData = {};
let cleanedData = {};

const getHost = curr => {
  const animators = (curr.credits || [])
    .filter(credit => credit.role && credit.role.key === 'ANIMATOR' && credit.fullName)
    .map(credit => credit.fullName.trim());

  if (animators.length > 0) {
    return animators.join(', ');
  }

  if (curr.mediaProgram && typeof curr.mediaProgram.animator === 'string' && curr.mediaProgram.animator.trim().length) {
    return curr.mediaProgram.animator.trim();
  }

  return null;
};

const getImg = curr => {
  if (curr.image && curr.image.illustration && curr.image.illustration.m) {
    return curr.image.illustration.m;
  }

  if (curr.mediaProgram && curr.mediaProgram.image && curr.mediaProgram.image.cover && curr.mediaProgram.image.cover.m) {
    return curr.mediaProgram.image.cover.m;
  }

  return null;
};

const format = (dateObj, name) => {
  const seenIds = new Set();

  // we use reduce instead of map to act as a map+filter in one pass
  cleanedData[name] = scrapedData[name].reduce(function (prev, curr) {
    if (!curr.scheduledAt || !curr.title) {
      return prev;
    }

    // both fetched days can return the same entry
    if (seenIds.has(curr.id)) {
      return prev;
    }
    seenIds.add(curr.id);

    const startDateTime = moment(curr.scheduledAt, moment.ISO_8601);

    if (!startDateTime.isValid()) {
      return prev;
    }

    // keep only shows starting on the requested day
    startDateTime.tz(dateObj.tz());
    if (!startDateTime.isSame(dateObj, 'day')) {
      return prev;
    }

    let description = '';

    if (typeof curr.subtitle === 'string' && curr.subtitle.trim().length) {
      description += curr.subtitle.trim();
      description += ' / ';
    }

    if (typeof curr.description === 'string') {
      description += curr.description;
    }

    const newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'img': getImg(curr),
      'title': curr.title.trim(),
      'description': description.trim()
    };

    if (curr.duration) {
      newEntry.date_time_end = moment(startDateTime).add(curr.duration, 'seconds').toISOString();
    }

    const host = getHost(curr);
    if (host !== null) {
      newEntry.host = host;
    }

    prev.push(newEntry);
    return prev;
  }, []);

  cleanedData[name].sort((a, b) => a.date_time_start.localeCompare(b.date_time_start));

  return Promise.resolve(cleanedData[name]);
};

const fetch = async (name, dateObj, id) => {
  const previousDayObj = moment(dateObj);

  previousDayObj.locale('fr');
  previousDayObj.tz('Europe/Brussels');
  previousDayObj.subtract(1, 'days');

  const dayBefore = previousDayObj.format('YYYY-MM-DD');
  const day = dateObj.format('YYYY-MM-DD');
  const url = `https://bff-service.rtbf.be/oaos/v1.6/schedulings?scheduledAfter=${dayBefore}T04%3A00%3A00.000Z&scheduledBefore=${day}T03%3A59%3A59.999Z&channelIds=${id}&_limit=500&platform=WEB`

  logger.log('info', `fetching ${url}`);

  const response = await axios.get(url);

  if (!scrapedData[name]) {
    scrapedData[name] = [];
  }

  scrapedData[name].push(...(response.data.data || []));
};

const fetchAll = (name, dateObj, id) => {
  /* the api returns a broadcast day (6am -> 6am) of the previous day for a given day,
 so we fetch the day and the next day to get the full day and then filter the list later  */
  const nextDay = moment(dateObj);

  nextDay.locale('fr');
  nextDay.tz('Europe/Brussels');
  nextDay.add(1, 'days');

  dateObj.locale('fr');
  dateObj.tz('Europe/Brussels');

  return fetch(name, dateObj, id)
    .then(() => {
      return fetch(name, nextDay, id);
    });
};

const getScrap = (dateObj, name, id) => {
  scrapedData[name] = [];
  return fetchAll(name, dateObj, id)
    .then(() => {
      return format(dateObj, name);
    });
};

export default {
  supportTomorrow: true,
  getScrap
};
