import axios from 'axios';
import * as cheerio from 'cheerio';
import moment from 'moment-timezone';
import logger from '../../lib/logger.js';

const dayFrInv = {
  1: 'Lundi',
  2: 'Mardi',
  3: 'Mercredi',
  4: 'Jeudi',
  5: 'Vendredi',
  6: 'Samedi',
  7: 'Dimanche'
};

let scrapedData = [];

const fetchDesc = async (showId) => {
  try {
    console.log(`fetching ${showId}`);

    const response = await axios.get(`https://radios-totolive.fr/api/page.php?page=emission&id=${showId}`);
    // the api returns a json with the page markup in the 'html' key
    const json = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;

    if (!json || !json.html) {
      return null;
    }

    const $ = cheerio.load(json.html);
    const data = $.extract({
      img: {
        selector: '.detail-image img',
        value: 'src'
      },
      host: 'h3.animateur-card-name',
      description: [
        {
          selector: 'div.detail-description > :is(h2, p, div, ol)',
          value: el => {
            if (el.name !== 'ol') {
              return $(el).text().trim();
            }

            // one line per list item
            return $(el).children('li').map((i, li) => $(li).text().trim()).get().join('\n');
          }
        }
      ]
    });

    if (!data) {
      return null;
    }

    return {
      description: (data.description || []).filter(text => text !== '').join('\n') || null,
      img: data.img || null,
      host: data.host || null,
    };
  } catch (error) {
    logger.log('error fetching description');
    return null;
  }
};

const format = async dateObj => {
  dateObj.tz('Europe/Paris');

  const cleanedData = [];

  for (const entry of scrapedData) {
    if (!entry.datetime_start || !entry.title) {
      continue;
    }

    let regexp = new RegExp(/([0-9]{1,2})[:]([0-9]{1,2})/);
    let match = entry.datetime_start.match(regexp);

    if (!match) {
      continue;
    }

    const startDateTime = moment(dateObj);
    const endDateTime = moment(dateObj);

    startDateTime.hour(match[1]);
    startDateTime.minute(match[2]);
    startDateTime.second(0);

    match = entry.datetime_end.match(regexp);

    if (!match) {
      continue;
    }

    endDateTime.hour(match[1]);
    endDateTime.minute(match[2]);
    endDateTime.second(0);

    // midnight etc
    if (startDateTime.hour() > endDateTime.hour() || (endDateTime.hour() === 0 && endDateTime.minute() === 0)) {
      endDateTime.add(1, 'days');
    }

    const newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString(),
      'title': entry.title.trim(),
      'img': entry.img ? `https://radios-totolive.fr/${entry.img}` : null
    };

    if (entry.show_id) {
      const details = await fetchDesc(entry.show_id);

      if (details && details.description) {
        newEntry.description = details.description;
      }

      // image of the show page if any, else the one from the grid
      if (details && details.img) {
        newEntry.img = `https://radios-totolive.fr/${details.img}`;
      }

      // image of the show page if any, else the one from the grid
      if (details && details.host) {
        newEntry.host = details.host;
      }
    }

    cleanedData.push(newEntry);
  }

  return Promise.resolve(cleanedData);
};

const fetch = async dateObj => {
  dateObj.locale('fr');
  const url = 'https://radios-totolive.fr/api/page.php?page=grille';
  const day = dayFrInv[dateObj.isoWeekday()];

  logger.log('info', `fetching ${url} (day: ${day})`);

  const response = await axios.get(url);
  // the api returns a json with the page markup in the 'html' key
  const json = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;

  if (!json || !json.html) {
    return Promise.resolve(true);
  }

  const $ = cheerio.load(json.html);
  const data = $.extract({
    shows: [
      {
        selector: `#jour-${day} .grille-programmes > .grille-item`,
        value: {
          datetime_start: 'span.time-start',
          datetime_end: 'span.time-end',
          title: 'h3.grille-emission-name',
          img: {
            selector: '.grille-emission-img img',
            value: 'src'
          },
          show_id: {
            selector: ':scope',
            value: 'data-id'
          },
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
  getName: 'radio_toto_live',
  supportTomorrow: true,
  getScrap
};
