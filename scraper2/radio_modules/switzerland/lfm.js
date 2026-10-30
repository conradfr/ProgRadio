import axios from 'axios';
import * as cheerio from 'cheerio';
import moment from 'moment-timezone';
import logger from '../../lib/logger.js';

// The grid mixes shows and sections with only a start time:
// - "LFM INFO : LE FLASH INFO", a title with ":" is a section
// - "LE 6/9 LFM" airs from 6 to 9, any entry starting within is a section
// - the other shows end when the next one starts

const regexpTime = /([0-9]{1,2}):([0-9]{2})/;
const regexpHours = /\b([0-9]{1,2})\/([0-9]{1,2})\b/;

let scrapedData = [];

const dateTimeFromHourMinute = (dateObj, hour, minute) => {
  const dateTime = moment(dateObj);

  dateTime.hour(hour);
  dateTime.minute(minute);
  dateTime.second(0);
  dateTime.millisecond(0);

  return dateTime;
};

const format = async dateObj => {
  dateObj.tz('Europe/Zurich');

  const entries = scrapedData.reduce(function (prev, entry) {
    const match = (entry.datetime_raw || '').match(regexpTime);

    if (!match || !entry.title) {
      return prev;
    }

    let img = null;

    if (entry.img) {
      img = entry.img.trim();
    } else if (entry.img_alt) {
      img = entry.img_alt.trim();
    }

    const description = (entry.description || '').trim();
    const title = entry.title.trim();

    prev.push({
      'start': dateTimeFromHourMinute(dateObj, parseInt(match[1]), parseInt(match[2])),
      'end': null,
      'title': title,
      'is_section': title.includes(':'),
      'img': img,
      'host': entry.host ? entry.host.replace(/^\s*Avec\s+/i, '').trim() : null,
      // "..." when empty
      'description': description !== '' && description !== '...' ? description : null
    });

    return prev;
  }, []);

  // stable, the order of the page is kept for the same time
  entries.sort((a, b) => a.start.valueOf() - b.start.valueOf());

  const shows = [];
  const sections = [];

  entries.forEach(entry => {
    if (entry.is_section) {
      sections.push(entry);
      return;
    }

    // within a "6/9" show
    const container = shows.find(show =>
      show.end !== null && entry.start.isSameOrAfter(show.start) && entry.start.isBefore(show.end)
    );

    if (container) {
      sections.push(entry);
      return;
    }

    const hours = entry.title.match(regexpHours);

    if (hours) {
      entry.end = dateTimeFromHourMinute(dateObj, parseInt(hours[2]) % 24, 0);

      // midnight etc
      if (entry.end.isSameOrBefore(entry.start)) {
        entry.end.add(1, 'days');
      }
    }

    shows.push(entry);
  });

  // also aired as a section the same day, "L'INFO TRAFIQUÉE" within the 6/9 and alone at 13:30
  const sectionTitles = new Set(sections.map(section => section.title));

  for (let index = shows.length - 1; index >= 0; index--) {
    if (shows[index].end === null && sectionTitles.has(shows[index].title)) {
      sections.push(...shows.splice(index, 1));
    }
  }

  // the other shows end when the next one starts, the last one at midnight
  shows.forEach((show, index) => {
    if (show.end !== null) {
      return;
    }

    if (index + 1 < shows.length) {
      show.end = moment(shows[index + 1].start);
    } else {
      show.end = moment(dateObj).startOf('day').add(1, 'days');
    }
  });

  const cleanedData = shows.map(show => {
    return {
      'date_time_start': show.start.toISOString(),
      'date_time_end': show.end.toISOString(),
      'title': show.title,
      'img': show.img,
      'host': show.host,
      'description': show.description,
      'sections': []
    };
  });

  sections.forEach(section => {
    const index = shows.findIndex(show =>
      section.start.isSameOrAfter(show.start) && section.start.isBefore(show.end)
    );

    // outside of a show
    if (index === -1) {
      return;
    }

    // "LE 6/9 LFM : L'HOROSCOPE" within "LE 6/9 LFM" is "L'HOROSCOPE"
    const [prefix, ...rest] = section.title.split(':');
    const title = rest.length > 0 && prefix.trim() === shows[index].title ? rest.join(':').trim() : section.title;

    cleanedData[index].sections.push({
      'date_time_start': section.start.toISOString(),
      'title': title,
      'presenter': section.host,
      'description': section.description,
      'img': section.img
    });
  });

  cleanedData.forEach(show => show.sections.sort((a, b) => a.date_time_start.localeCompare(b.date_time_start)));

  return Promise.resolve(cleanedData);
};

const fetch = async dateObj => {
  dateObj.locale('fr');
  const url = `https://www.lfm.ch/emissions-programme/?date=${dateObj.format('YYYY-MM-DD')}`;

  logger.log('info', `fetching ${url}`);

  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  const data = $.extract({
    shows: [
      {
        selector: `.chroniques .chronique`,
        value: {
          datetime_raw: '.chronique_heure',
          title: 'h3',
          img_alt: {
            selector: '.image img',
            value: 'src'
          },
          img: {
            selector: '.image img',
            value: 'data-lazy-src'
          },
          host: '.animators',
          description: '.description',
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
  scrapedData = [];

  return fetchAll(dateObj)
    .then(() => {
      return format(dateObj);
    });
};
export default {
  getName: 'lfm',
  supportTomorrow: true,
  getScrap
};
