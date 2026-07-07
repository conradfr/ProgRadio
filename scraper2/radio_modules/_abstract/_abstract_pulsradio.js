import axios from 'axios';
import moment from 'moment-timezone';
import { XMLParser } from 'fast-xml-parser';

import logger from '../../lib/logger.js';

let scrapedData = {};

const format = (dateObj, name) => {
  const mains = [];
  dateObj.locale('fr');
  const dayOfWeek = dateObj.isoWeekday();

  const parser = new XMLParser();
  let jObj = parser.parse(scrapedData[name]);

  if (!jObj.week.event) {
    return {};
  }

  for(let i = 0; i < jObj.week.event.length; i++) {
    if (jObj.week.event[i].day !== dayOfWeek) {
      continue;
    }

    // new show
    if ((mains.length > 0 && mains[mains.length - 1].title !== jObj.week.event[i].nom) || mains.length === 0) {
      const startDateTime = moment(dateObj);
      startDateTime.hour(jObj.week.event[i].hour);
      startDateTime.minute(0);
      startDateTime.second(0);

      const newEntry = {
        'date_time_start': startDateTime.toISOString(),
        'title': jObj.week.event[i].nom
      };

        mains.push(newEntry);
    } else {
      // same show
      const endDateTime = moment(dateObj);
      endDateTime.hour(jObj.week.event[i].hour + 1);
      endDateTime.minute(0);
      endDateTime.second(0);

      mains[mains.length - 1]['date_time_end'] = endDateTime.toISOString()
    }
  }

  return Promise.resolve(mains);
};

const fetch = (flux, name) => {
  const url = `https://api.pulsradio.com/week${flux}.xml`
  logger.log('info', `fetching ${url}`);

  return axios.get(url)
      .then(function (response) {
        scrapedData[name] = response.data;
        return true;
      }).catch(() => true);
};

const fetchAll = (flux, name) => {
  return fetch(flux, name);
};

const getScrap = (dateObj, flux, name) => {
  return fetchAll(flux, name)
    .then(() => {
      return format(dateObj, name);
    }).catch(() => true);
};

export default {
  getScrap,
  supportTomorrow: true,
};

