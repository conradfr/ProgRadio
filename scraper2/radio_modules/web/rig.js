import axios from 'axios';
import * as cheerio from 'cheerio';
import moment from 'moment-timezone';
import logger from '../../lib/logger.js';

let scrapedData = [];

const format = async dateObj => {
  dateObj.tz('Europe/Paris');

  const cleanedData = scrapedData.reduce(function (prev, entry) {
    const regexp = new RegExp(/([0-9]{1,2})[h]([0-9]{1,2})/);

    // START

    let match = entry.datetime_start_raw.match(regexp);

    if (!match) {
      return prev;
    }

    const startDateTime = moment(dateObj);
    let endDateTime = null;

    startDateTime.hour(match[1]);
    startDateTime.minute(match[2]);
    startDateTime.second(0);

    // END

    match = entry.datetime_end_raw.match(regexp);

    if (match) {
      endDateTime = moment(dateObj);

      endDateTime.hour(match[1]);
      endDateTime.minute(match[2]);
      endDateTime.second(0);

      // midnight etc
      if (startDateTime.hour() > endDateTime.hour() || (endDateTime.hour() === 0 && endDateTime.minute() === 0)) {
        endDateTime.add(1, 'days');
      }
    }

    const newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString(),
      'title': entry.title.trim(),
      'img': entry.img ? `https://www.rigfm.fr${entry.img.trim()}` : null,
      'description': entry.description.trim() || null,
      'sections': []
    };

    if (entry.sections && entry.sections.length > 0) {
      entry.sections.forEach(function (chronicle) {
        const match = chronicle.datetime_raw.match(regexp);

        if (!match) {
          return;
        }

        const sectionStartDateTime = moment(dateObj);

        sectionStartDateTime.hour(match[1]);
        sectionStartDateTime.minute(match[2]);
        sectionStartDateTime.second(0);

        newEntry.sections.push(
          {
            date_time_start: sectionStartDateTime.toISOString(),
            title: chronicle.title,
          }
        );
      });
    }

    prev.push(newEntry);
    return prev;
  }, []);

  return Promise.resolve(cleanedData);
};

const fetch = async dateObj => {
  dateObj.locale('fr');
  const url = 'https://www.rigfm.fr/grille';

  logger.log('info', `fetching ${url}`);

  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  const data = $.extract({
    shows: [
      {
        selector: `.schedule-day-panel[data-date-key="${dateObj.format('YYYY-MM-DD')}"] > .schedule-list > .schedule-card`,
        value: {
          datetime_start_raw: '.schedule-time-start',
          datetime_end_raw: '.schedule-time-end',
          title: '.schedule-card-title',
          img: {
            selector: '.schedule-card-image img',
            value: 'src'
          },
          description: '.schedule-card-desc',
          // link: {
          //   selector: 'a.schedule-card-primary',
          //   value: 'href'
          // },
          sections: [
            {
              selector: '.schedule-card-nests > .schedule-card-nest',
              value: {
                datetime_raw: '.schedule-nest-time',
                title: '.schedule-nest-title'
              }
            }
          ]
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
  getName: 'rig',
  supportTomorrow: true,
  getScrap
};
