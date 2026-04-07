import axios from 'axios';
import * as cheerio from 'cheerio';
import moment from 'moment-timezone';
import logger from '../../lib/logger.js';

let scrapedData = [];

const format = async dateObj => {
  const cleanedData = scrapedData.reduce(function (prev, entry) {
    let regexp = new RegExp(/([0-9]{1,2})[h]([0-9]{2})\s>\s([0-9]{1,2})[h]([0-9]{2})/);
    let match = entry.datetime_raw.match(regexp);

    if (!match) {
      return prev;
    }

    const startDateTime = moment(dateObj);
    const endDateTime = moment(dateObj);

    startDateTime.hour(match[1]);
    startDateTime.minute(match[2]);
    startDateTime.second(0);
    endDateTime.hour(match[3]);
    endDateTime.minute(match[4]);
    endDateTime.second(0);

    const newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString(),
      'title': entry.title,
    };

    if (entry.host && entry.host.length > 0) {
      let host = [];
      let imgDone = false;
      for (const one of entry.host) {
        host.push(one.host.replace(/\s\s+/g, '').trim());

        // we take the first host picture as there's no show image
        if (!imgDone && one.img) {
          newEntry.img = `https://www.maximumfm.be${one.img}`;
          imgDone = true;
        }
      }

      if (host.length > 0) {
        newEntry.host = host.join(', ');
      }
    }

    // remove placeholder (guys ...)
    if (entry.description) {
      newEntry.description = entry.description.trim();
    }

    prev.push(newEntry);
    return prev;
  }, []);

  return Promise.resolve(cleanedData);
};

const fetch = async dateObj => {
  const format = 'YYYY-MM-DD';
  const dateStr = dateObj.format(format)
  const url = `https://www.maximumfm.be/radio/${dateStr}#radio-planning`;

  logger.log('info', `fetching ${url}`);

  const response = await axios.get(url);
  const html = response.data;
  const $ = cheerio.load(html);
  const data = $.extract({
    shows: [
      {
        selector: '#radio-planning ul.list-unstyled li',
        value: {
          datetime_raw: 'small',
          title: 'h3',
          id: {
            selector: 'h3',
            value: 'data-bs-target'
          },
        }
      }
    ]
  });

  if (data && data.shows) {
    for (const item of data.shows) {
      let dataItem = $.extract({
        description: {
          selector: item.id,
          value: (el) => {
            return $(el)
              .contents()
              .filter(function () {
                return this.nodeType === 3; // text nodes only
              })
              .text()
              .trim();
          }
        },
        host: [
          {
            selector: `${item.id} figure`,
            value: {
              img: {
                selector: 'img',
                value: 'src'
              },
              host: 'figcaption',
            }
          }
        ],
      });

      if (dataItem) {
        Object.assign(item, dataItem);
      }
    }

    scrapedData = data.shows;
  }

  return Promise.resolve(true);
};

const fetchAll = dateObj => {
  return fetch(dateObj);
};

const getScrap = dateObj => {
  dateObj.tz('Europe/Brussels');
  return fetchAll(dateObj)
    .then(() => {
      return format(dateObj);
    });
};
export default {
  getName: 'maximumfm',
  supportTomorrow: true,
  getScrap
};
