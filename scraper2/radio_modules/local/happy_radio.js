import * as cheerio from 'cheerio';
import moment from 'moment-timezone';
import logger from '../../lib/logger.js';
import cache from '../../lib/cache.js';

// The schedule is shared by all the sub radios (bergerac, perigueux, sarlat),
// only some short local segments differ and they are not listed.
// The show pages have no description and outdated hours, so they are not followed.

const days = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

let scrapedData = {};

// "de 7h – 9h", "14h à 16h", "de 19h30 à 20h"
const regexp = /(?:\bde\s+)?([0-9]{1,2})h([0-9]{2})?\s*(?:–|-|à)\s*([0-9]{1,2})h([0-9]{2})?/;
// news, weather etc. "toutes les demi-heures ou toutes les heures de 7h à 19h30"
const regexpRecurring = /toutes les (demi-)?heures/i;
// can't know which weeks it airs
const regexpIrregular = /toutes les [0-9]+ semaines|une fois par mois/i;
const regexpDayMention = new RegExp(`\\ble (${days.join('|')})\\b`, 'i');
// order matters: day ranges and groups before single days
const regexpSchedule = new RegExp(
  `du (${days.join('|')}) au (${days.join('|')})|toutes? la semaine|tous les jours|week-?end|(${days.join('|')})|([0-9]{1,2})h([0-9]{2})?`,
  'gi'
);

// "du lundi au vendredi à 7h15, 8h15", "le vendredi soir à 17h10 et le samedi à 6h10, 7h10"
// returns the times of the given day, the post categories are used when no day is mentioned
// (they are sometimes wrong, the text wins)
const sectionTimes = (text, day, categories) => {
  const times = [];
  let currentDays = [];
  let lastWasTime = false;

  for (const m of text.matchAll(regexpSchedule)) {
    if (m[4] !== undefined) {
      const timeDays = currentDays.length > 0 ? currentDays : categories;
      if (timeDays.includes(day)) {
        times.push({ hour: parseInt(m[4]), minute: parseInt(m[5] || 0) });
      }

      lastWasTime = true;
      continue;
    }

    // a day after a list of times starts a new group
    if (lastWasTime) {
      currentDays = [];
      lastWasTime = false;
    }

    const token = m[0].toLowerCase();

    if (m[1] !== undefined) {
      currentDays.push(...days.slice(days.indexOf(m[1].toLowerCase()), days.indexOf(m[2].toLowerCase()) + 1));
    } else if (token.endsWith('semaine')) {
      // "toute la semaine" is the week days only
      currentDays.push(...days.slice(0, 5));
    } else if (token === 'tous les jours') {
      currentDays.push(...days);
    } else if (token.startsWith('week')) {
      currentDays.push('samedi', 'dimanche');
    } else {
      currentDays.push(m[3].toLowerCase());
    }
  }

  return times;
};

const format = async (dateObj, subRadio) => {
  const day = days[dateObj.isoWeekday() - 1];

  // a list of times (no end) is a section of the show airing at that time
  const sectionsRaw = [];

  const cleanedData = scrapedData[subRadio].reduce(function (prev, entry) {
    if (!entry.title) {
      return prev;
    }

    // titles can contain zero width spaces
    const titleRaw = entry.title.replace(/[\u200b\u00a0]/g, ' ').trim();

    if (regexpRecurring.test(titleRaw) || regexpIrregular.test(titleRaw)) {
      return prev;
    }

    const match = titleRaw.match(regexp);

    if (match === null) {
      // "L’Horoscope, toutes la semaine à 6h45, 7h45" / "L’Agenda sportif : le vendredi soir à 17h10"
      const separator = titleRaw.search(/,|\s:\s/);

      if (separator > 0) {
        const title = titleRaw.substring(0, separator).trim();
        sectionTimes(titleRaw.substring(separator), day, entry.days)
          .forEach(time => sectionsRaw.push({ time, title }));
      }

      return prev;
    }

    if (!entry.days.includes(day)) {
      return prev;
    }

    // "La Causerie, le lundi de 19h30 à 20h" is listed on other days too
    const beforeTime = titleRaw.substring(0, match.index);
    const dayMention = beforeTime.match(regexpDayMention);
    if (dayMention !== null && dayMention[1].toLowerCase() !== day) {
      return prev;
    }

    const title = beforeTime.split(',')[0].replace(/[\s,:–-]+$/, '').trim();

    const startDateTime = moment(dateObj);
    startDateTime.hour(parseInt(match[1]));
    startDateTime.minute(parseInt(match[2] || 0));
    startDateTime.second(0);

    const endDateTime = moment(dateObj);
    endDateTime.hour(parseInt(match[3]));
    endDateTime.minute(parseInt(match[4] || 0));
    endDateTime.second(0);

    // midnight etc
    if (startDateTime.isSameOrAfter(endDateTime)) {
      endDateTime.add(1, 'days');
    }

    prev.push({
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString(),
      'title': title || titleRaw,
      'img': entry.img && !entry.img.startsWith('data:') ? entry.img.trim() : null,
      'description': null,
      'sections': []
    });

    return prev;
  }, []);

  sectionsRaw.forEach(function ({ time, title }) {
    const sectionStartDateTime = moment(dateObj);

    sectionStartDateTime.hour(time.hour);
    sectionStartDateTime.minute(time.minute);
    sectionStartDateTime.second(0);

    const show = cleanedData.find(show =>
      sectionStartDateTime.isSameOrAfter(show.date_time_start) && sectionStartDateTime.isBefore(show.date_time_end)
    );

    // outside of a regular show
    if (!show) {
      return;
    }

    const dateTimeStart = sectionStartDateTime.toISOString();

    // some are listed twice under different names (Info Sport / Les Résultats sportifs), keep the first one
    if (show.sections.some(section => section.date_time_start === dateTimeStart)) {
      return;
    }

    show.sections.push({
      'date_time_start': dateTimeStart,
      'title': title,
      'presenter': null
    });
  });

  cleanedData.sort((a, b) => a.date_time_start.localeCompare(b.date_time_start));
  cleanedData.forEach(show => show.sections.sort((a, b) => a.date_time_start.localeCompare(b.date_time_start)));

  return Promise.resolve(cleanedData);
};

const fetch = async subRadio => {
  const url = 'https://happyradio.fr/emissions';

  logger.log('info', `fetching ${url} (${subRadio})`);

  // the sub radios are scraped concurrently, the cache makes it a single request
  const html = await cache.fetchUrl(url);
  const $ = cheerio.load(html);

  scrapedData[subRadio] = $('.elementor-portfolio-item').map(function () {
    const item = $(this);
    const img = item.find('.elementor-portfolio-item__img img').first();

    return {
      // days are the post categories: "category-lundi category-mardi ..."
      'days': (item.attr('class') || '').split(/\s+/)
        .filter(c => c.startsWith('category-'))
        .map(c => c.substring('category-'.length)),
      'title': item.find('.elementor-portfolio-item__title').text(),
      // lazy loaded, the real url is in data-src
      'img': img.attr('data-src') || img.attr('src') || null
    };
  }).get();

  return Promise.resolve(true);
};

const fetchAll = subRadio => {
  return fetch(subRadio);
};

const getScrap = (dateObj, subRadio) => {
  dateObj = moment(dateObj).tz('Europe/Paris');
  dateObj.locale('fr');
  scrapedData[subRadio] = [];

  return fetchAll(subRadio)
    .then(() => {
      return format(dateObj, subRadio);
    });
};

export default {
  getName: 'happy_radio',
  supportTomorrow: true,
  getScrap
};
