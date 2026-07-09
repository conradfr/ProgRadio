import axios from 'axios';
import * as cheerio from 'cheerio';
import moment from 'moment-timezone';
import logger from '../../lib/logger.js';

const dayFr = {
  'Lundi': 1,
  'Mardi': 2,
  'Mercredi': 3,
  'Jeudi': 4,
  'Vendredi': 5,
  'Samedi': 6,
  'Dimanche': 7
};

const dayFrInv = {
  1: 'lundi',
  2: 'mardi',
  3: 'mercredi',
  4: 'jeudi',
  5: 'vendredi',
  6: 'samedi',
  7: 'dimanche'
};

let scrapedData = [];

const getHost = async (url) => {
  logger.log('info', `fetching ${url}`);
  const hosts = [];

  const response = await axios.get(url);
  const html = response.data;
  const $ = cheerio.load(html);
  $('.anim-row:not(.podcast-row) a > h4').each((i, el) => {
    hosts.push($(el).text().trim());
  });

  if (hosts.length > 0) {
    return Promise.resolve(hosts);
  }

  return Promise.resolve(null);
};

const format = async (dateObj, name) => {
  dateObj.tz('Europe/Paris');
  dateObj.locale('fr');

  const cleanedData = scrapedData[name].reduce(async function (prevP, entry) {
    const prev = await prevP;
    if (!entry.datetime_raw) {
      return prev;
    }

    let time = [];

    let regexp = new RegExp(/^Du\s(Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi|Dimanche)\sau\s(Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi|Dimanche), de ([0-9]{1,2})[:]([0-9]{2})\sà\s([0-9]{1,2})[:]([0-9]{2})/);
    let match = entry.datetime_raw.match(regexp);

    if (match === null) {
      // maybe it's weekend
      regexp = new RegExp(/^Le week-end, de ([0-9]{1,2})[:]([0-9]{2})\sà\s([0-9]{1,2})[:]([0-9]{2})/);
      match = entry.datetime_raw.match(regexp);

      if (match !== null) {
        // not week-end ?
        const dayNum = dateObj.isoWeekday();
        if (dayNum !== 6 && dayNum !== 7) {
          return prev;
        }

        time = [match[1], match[2], match[3], match[4]];
      }
    } else {
      // not in day interval
      const dayNum = dateObj.isoWeekday();
      if (dayNum < dayFr[match[1]] || dayNum > dayFr[match[2]]) {
        return prev;
      }

      time = [match[3], match[4], match[5], match[6]];
    }

    // maybe it's a list of days, e.g. "Lundi, Mardi, Jeudi et Dimanche, de 16:00 à 17:00"
    if (match === null) {
      regexp = new RegExp(/^((?:Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi|Dimanche)(?:(?:,\s|\set\s)(?:Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi|Dimanche))+),\sde\s([0-9]{1,2})[:]([0-9]{2})\sà\s([0-9]{1,2})[:]([0-9]{2})/);
      match = entry.datetime_raw.match(regexp);

      if (match !== null) {
        // not one of the listed days ?
        const dayNum = dateObj.isoWeekday();
        const days = match[1].split(/,\s|\set\s/).map(d => dayFr[d]);
        if (!days.includes(dayNum)) {
          return prev;
        }

        time = [match[2], match[3], match[4], match[5]];
      }
    }

    // maybe it's just one day
    if (match === null) {
      regexp = new RegExp(/^(Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi|Dimanche), de ([0-9]{1,2})[:]([0-9]{2})\sà\s([0-9]{1,2})[:]([0-9]{2})/);
      match = entry.datetime_raw.match(regexp);

      if (match !== null) {
        const dayNum = dateObj.isoWeekday();
        if (dayNum !== dayFr[match[1]]) {
          return prev;
        }

        time = [match[2], match[3], match[4], match[5]];
      }
    }

    // maybe it's just one day
    if (match === null) {
      regexp = new RegExp(/^(Toute la semaine), de ([0-9]{1,2})[:]([0-9]{2})\sà\s([0-9]{1,2})[:]([0-9]{2})/);
      match = entry.datetime_raw.match(regexp);

      if (match !== null) {
        time = [match[2], match[3], match[4], match[5]];
      }
    }

    if (match === null) {
      return prev;
    }

    const startDateTime = moment(dateObj);
    startDateTime.hour(time[0]);
    startDateTime.minute(time[1]);
    startDateTime.second(0);

    const endDateTime = moment(dateObj);
    endDateTime.hour(time[2]);
    endDateTime.minute(time[3]);
    endDateTime.second(0);

    // end at midnight etc
    if (time[2] < time[0]) {
      endDateTime.add(1, 'days');
    }

    const newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString(),
      'img': `https://www.banquisefm.com${entry.img}`,
      'title': entry.title.trim(),
      'description': entry.description.trim(),
    };

    if (entry.link) {
      const host = await getHost(entry.link);
      if (host) {
        newEntry.host = host.join(', ');
      }
    }

    prev.push(newEntry);
    return prev;
  }, []);

  return await Promise.resolve(cleanedData);
};

const fetch = async (dateObj, name, url) => {
  dateObj.locale('fr');
  const day = dayFrInv[dateObj.isoWeekday()];

  logger.log('info', `fetching ${url}`);

  const response = await axios.get(url);
  const html = response.data;
  const $ = cheerio.load(html);
  const data = $.extract({
    shows: [
      {
        selector: `div.m-t-30 .${day}`,
        value: {
          datetime_raw: '.program-date',
          title: 'h4',
          description: 'span.list_text',
          img: {
            selector: '.list-img-thumb',
            value: 'src'
          },
          link: {
            selector: 'a.img-link',
            value: 'href'
          },
        }
      }
    ]
  });

  scrapedData[name] = data.shows;

  console.log(data.shows);

  return Promise.resolve(true);
};

const fetchAll = (dateObj, name, url) => {
  return fetch(dateObj, name, url);
};

const getScrap = (dateObj, name, url, config) => {
  scrapedData[name] = [];
  return fetchAll(dateObj, name, url)
    .then(() => {
      return format(dateObj, name);
    });
};

export default {
  supportTomorrow: true,
  getScrap
};
