import axios from 'axios';
import * as cheerio from 'cheerio';
import moment from 'moment-timezone';
import logger from '../../lib/logger.js';

const dayEn = {
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
  7: 'sunday'
};

let scrapedData = [];
// window.RadioTheme.programSlots: start/end are minutes since monday 00:00 (Europe/Paris), end exclusive
let programSlots = [];

const timeRegexp = /([0-9]{1,2})h([0-9]{2})/;

const normalize = text => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

// minutes from the given day at 00:00, can be >= 1440 when ending the next day
const dateTimeFromMinutes = (dateObj, minutes) => {
  return moment(dateObj)
    .startOf('day')
    .add(Math.floor(minutes / 1440), 'day')
    .hour(Math.floor((minutes % 1440) / 60))
    .minute(minutes % 60)
    .second(0);
};

const format = async dateObj => {
  dateObj.tz('Europe/Paris');
  const dayIndex = dateObj.isoWeekday() - 1;

  const cleanedData = scrapedData.reduce(function (prev, entry, index) {
    const match = (entry.datetime_start_raw || '').match(timeRegexp);

    if (!match) {
      return prev;
    }

    const startMinutes = parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
    const slot = programSlots.find(
      s => s.start === dayIndex * 1440 + startMinutes && normalize(s.title) === normalize(entry.title)
    );

    let endMinutes = slot ? slot.end - dayIndex * 1440 : null;

    // fallback: next show start
    if (endMinutes === null && scrapedData[index + 1]) {
      const nextMatch = (scrapedData[index + 1].datetime_start_raw || '').match(timeRegexp);
      if (nextMatch) {
        endMinutes = parseInt(nextMatch[1], 10) * 60 + parseInt(nextMatch[2], 10);
      }
    }

    if (endMinutes === null || endMinutes <= startMinutes) {
      return prev;
    }

    const newEntry = {
      'date_time_start': dateTimeFromMinutes(dateObj, startMinutes).toISOString(),
      'date_time_end': dateTimeFromMinutes(dateObj, endMinutes).toISOString(),
      'title': entry.title.trim(),
      'img': entry.img ? entry.img.trim() : null,
      'description': (entry.description || []).filter(text => text !== '').join(' ') || null,
    };

    prev.push(newEntry);
    return prev;
  }, []);

  return Promise.resolve(cleanedData);
};

const fetch = async dateObj => {
  const url = 'https://radiorks.com/programs';
  dateObj.locale('fr');
  const day = dayEn[dateObj.isoWeekday()];

  logger.log('info', `fetching ${url}`);

  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  const data = $.extract({
    shows: [
      {
        selector: `#tab-${day} > .programs-list`,
        value: {
          datetime_start_raw: '.time',
          title: '.title',
          img: {
            selector: '.img-wpr img',
            value: 'src'
          },
          description: ['.details p'],
        }
      }
    ]
  });

  if (data && data.shows) {
    scrapedData = data.shows;
  }

  const themeMatch = response.data.match(/window\.RadioTheme=(\{[\s\S]*?\});<\/script>/);
  if (themeMatch) {
    try {
      programSlots = JSON.parse(themeMatch[1]).programSlots || [];
    } catch (e) {
      logger.log('warn', `rks: cannot parse RadioTheme: ${e.message}`);
    }
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
  getName: 'rks',
  supportTomorrow: true,
  getScrap
};
