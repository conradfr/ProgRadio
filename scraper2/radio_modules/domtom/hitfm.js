import axios from 'axios';
import * as cheerio from 'cheerio';
import moment from 'moment-timezone';
import logger from '../../lib/logger.js';

let scrapedData = [];

const format = dateObj => {
  // we use reduce instead of map to act as a map+filter in one pass
  const cleanedData = scrapedData.reduce(function (prev, curr, index, array) {
    let regexp = new RegExp(/^([0-9]{1,2})h([0-9]{1,2})\s-\s([0-9]{1,2})h([0-9]{1,2})/);
    let match = curr.datetime_raw.match(regexp);

    if (match === null) {
      return prev;
    }

    const startDateTime = moment(curr.dateObj);
    startDateTime.tz('Indian/Reunion');
    startDateTime.hour(match[1]);
    startDateTime.minute(match[2]);
    startDateTime.second(0);

    const endDateTime = moment(curr.dateObj);
    endDateTime.tz('Indian/Reunion');
    endDateTime.hour(match[3]);
    endDateTime.minute(match[4]);
    endDateTime.second(0);

    if (startDateTime.hour() > endDateTime.hour() || (endDateTime.hour() === 0 && endDateTime.minute() === 0)) {
      endDateTime.add(1, 'days');
    }

    const newEntry = {
      'title': curr.title.trim(),
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString()
    };

    prev.push(newEntry);
    return prev;
  }, []);

  return Promise.resolve(cleanedData);
};

const fetch = async dateObj => {
  dateObj.locale('fr');
  let url = 'https://hitfm.fr/programmes';
  const dayNum = dateObj.isoWeekday();

  logger.log('info', `fetching ${url}`);

  const response = await axios.get(url);
  const html = response.data;
  const $ = cheerio.load(html);
  const data = $.extract({
    shows: [
      {
        selector: `.week-panels div.week-panel[data-wday="${dayNum}"] .wk-show`,
        value: {
          datetime_raw: '.wk-time',
          title: '.wk-title',
        }
      }
    ]
  });

  scrapedData = data.shows;
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
  getName: 'hitfm',
  supportTomorrow: true,
  getScrap
};
