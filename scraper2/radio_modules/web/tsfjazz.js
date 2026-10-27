import axios from 'axios';
import * as cheerio from 'cheerio';
import moment from 'moment-timezone';
import logger from '../../lib/logger.js';

const dayFr = {
  1: 'lundi',
  2: 'mardi',
  3: 'mercredi',
  4: 'jeudi',
  5: 'vendredi',
  6: 'samedi',
  7: 'dimanche'
};

let scrapedData = [];

const format = async dateObj => {
  dateObj.tz('Europe/Paris');

  // 09:45-14:00 or 13h-14h / 16h-17H / 13h30-14h (minutes are optional with h)
  const regexp = /([0-9]{1,2})\s*[:hH]\s*([0-9]{0,2})\s*-\s*([0-9]{1,2})\s*[:hH]\s*([0-9]{0,2})/;
  const regexpSection = /^\s*([0-9]{1,2})\s*[:hH]\s*([0-9]{0,2})\s*$/;

  // a single time (no end) is a section of the show airing at that time
  const sectionsRaw = [];

  const cleanedData = scrapedData.reduce(function (prev, entry) {
    const datetimeRaw = entry.datetime_raw || '';
    const match = datetimeRaw.match(regexp);

    if (!match) {
      const matchSection = datetimeRaw.match(regexpSection);

      if (matchSection) {
        sectionsRaw.push({ match: matchSection, entry });
      }

      return prev;
    }

    const startDateTime = moment(dateObj);
    const endDateTime = moment(dateObj);

    startDateTime.hour(parseInt(match[1]));
    startDateTime.minute(parseInt(match[2] || 0));
    startDateTime.second(0);

    endDateTime.hour(parseInt(match[3]));
    endDateTime.minute(parseInt(match[4] || 0));
    endDateTime.second(0);

    // midnight etc
    if (startDateTime.hour() > endDateTime.hour() || (endDateTime.hour() === 0 && endDateTime.minute() === 0)) {
      endDateTime.add(1, 'days');
    }

    const newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString(),
      'title': entry.title.trim(),
      // src is root-relative and the path really starts with /www.tsfjazz.com/
      'img': entry.img ? new URL(entry.img.trim(), 'https://www.tsfjazz.com').href : null,
      'host': entry.host ? entry.host.trim() : null,
      'description': entry.description ? entry.description.trim() : null,
      'sections': []
    };

    prev.push(newEntry);
    return prev;
  }, []);

  sectionsRaw.forEach(function ({ match, entry }) {
    const sectionStartDateTime = moment(dateObj);

    sectionStartDateTime.hour(parseInt(match[1]));
    sectionStartDateTime.minute(parseInt(match[2] || 0));
    sectionStartDateTime.second(0);

    const findShow = dateTime => cleanedData.find(show =>
      dateTime.isSameOrAfter(show.date_time_start) && dateTime.isBefore(show.date_time_end)
    );

    let show = findShow(sectionStartDateTime);

    // after midnight, it belongs to the show that started the day before
    if (!show) {
      sectionStartDateTime.add(1, 'days');
      show = findShow(sectionStartDateTime);
    }

    if (!show) {
      return;
    }

    show.sections.push({
      'date_time_start': sectionStartDateTime.toISOString(),
      'title': entry.title.trim(),
      'presenter': entry.host ? entry.host.trim() : null
    });
  });

  cleanedData.forEach(show => show.sections.sort((a, b) => a.date_time_start.localeCompare(b.date_time_start)));

  return Promise.resolve(cleanedData);
};

const fetch = async dateObj => {
  dateObj.locale('fr');
  const day = dayFr[dateObj.isoWeekday()];
  const url = 'https://www.tsfjazz.com/la-grille';

  logger.log('info', `fetching ${url}`);

  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  const data = $.extract({
    shows: [
      {
        selector: `.day-panel[data-day-panel="${day}"] .grille-bloc`,
        value: {
          datetime_raw: '.horaires',
          title: 'h2',
          img: {
            selector: '.image-style-bsq',
            value: 'src'
          },
          host: '.subtitle',
          description: '.chapeau',
        }
      }
    ]
  });

  if (data && data.shows) {
    scrapedData = data.shows;
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
  getName: 'tsfjazz',
  supportTomorrow: true,
  getScrap
};
