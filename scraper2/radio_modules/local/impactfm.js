import axios from 'axios';
import * as cheerio from 'cheerio';
import moment from 'moment-timezone';
import utils from '../../lib/utils.js';
import logger from '../../lib/logger.js';

const image_prefix = 'https://www.impactfm.fr';

let scrapedData = [];
let cleanedData = [];

const format = (dateObj) => {
  // we use reduce instead of map to act as a map+filter in one pass
  cleanedData = scrapedData.reduce(function (prev, curr, index, array) {
    let regexp = new RegExp(/([0-9]{1,2}):([0-9]{1,2}) - ([0-9]{1,2}):([0-9]{1,2})/);
    let match = curr.datetime_raw.match(regexp);

    let startDateTime = null;
    let endDateTime = null;

    // note: midnight will be the wrong day but it's currently the same everyday so it's kinda ok
    if (match === null) {
      return prev;
    }

    startDateTime = moment(dateObj);
    startDateTime.hour(match[1]);
    startDateTime.minute(match[2]);
    startDateTime.second(0);

    endDateTime = moment(dateObj);
    endDateTime.hour(match[3]);
    endDateTime.minute(match[4]);
    endDateTime.second(0);

    const newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString(),
      'title': curr.title,
      'description': curr.description || null,
      'host': curr.host || null
    };

    /*
    Image are a php script that output the data, not dealt by the importer for now
    todo revisit later

    if (curr.img !== undefined) {
      newEntry.img = image_prefix + curr.img;
    }
    */

    prev.push(newEntry);
    return prev;
  }, []);

  return Promise.resolve(cleanedData);
};

const fetch = async (dateObj) => {
  scrapedData = [];
  dateObj.locale('fr');
  let day = utils.upperCaseWords(dateObj.format('d'));
  let url = `https://www.impactfm.fr/podcasts.php?cat=${day}`;

  logger.log('info', `fetching ${url}`);

  const response = await axios.get(url);
  const html = response.data;
  const $ = cheerio.load(html);
  const data = $.extract({
    shows: [
      {
        selector: '.article.vAnims',
        value: {
          datetime_raw: 'div.horaires-div',
          img: {
            selector: 'img.anim-picture',
            value: 'src'
          },
          title: 'div.titre > a.prog-link',
          host: 'a.defaut > i',
          description: 'div.prog-div'
        }
      }
    ]
  });

  scrapedData = data.shows.map(function (listing) {
    listing.dateObj = dateObj;
    return listing;
  });

  return Promise.resolve(true);
};

const fetchAll = (dateObj) => {
  return fetch(dateObj);
};

const getScrap = (dateObj) => {
  return fetchAll(dateObj)
    .then(() => {
      return format(dateObj);
    });
};

export default {
  getName: 'impactfm',
  supportTomorrow: true,
  getScrap
};
