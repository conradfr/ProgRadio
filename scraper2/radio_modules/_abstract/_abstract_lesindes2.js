import axios from 'axios';
import * as cheerio from 'cheerio';
import moment from 'moment-timezone';
import logger from '../../lib/logger.js';
import utils from '../../lib/utils.js';

let scrapedData = {};

const fetchHtml = async (url) => {
  const response = await axios.get(url);
  return cheerio.load(response.data);
};

const fetchDesc = async (url) => {
  try {
    const $ = await fetchHtml(url);
    const data = $.extract({
      description: ['div:not(.Aside) > div[id*=paragraphe] p'],
    });

    if (Array.isArray(data.description)) {
      // paragraphs can nest/overlap and yield repeated entries — dedupe
      // before they get joined downstream.
      data.description = [...new Set(data.description)];
    }

    return data;
  } catch (error) {
    logger.log('error fetching description');
    return null;
  }
};

const fetchDescAlt = async (url) => {
  try {
    const $ = await fetchHtml(url);
    const data = $.extract({
      description: '#emissionProgrammation',
    });

    return data;
  } catch (error) {
    logger.log('error fetching alt description');
    return null;
  }
};

const format = async (dateObj, name, description_prefix, hosts) => {
  if (scrapedData[name] === undefined || scrapedData[name][0] === undefined || scrapedData[name][0].json === 'undefined') {
    return Promise.resolve([]);
  }

  let schedule = null;
  try {
    const content = JSON.parse(scrapedData[name][0].json);
    schedule = content.props.pageProps.fetchedContent;

    let found = false;

    for (let i = 0; i < Object.keys(schedule).length; i++) {
      if (Object.keys(schedule)[i].startsWith('grilleDesProgrammes') === true) {
        found = true;
        schedule = schedule[Object.keys(schedule)[i]]['programmation'];
        break;
      }
    }

    if (found === false) {
      return Promise.resolve([]);
    }
  } catch (error) {
    return Promise.resolve([]);
  }

  const daySchedule = schedule.find(element => element.label === utils.upperCaseWords(dateObj.format('dddd'))).subItems;

  if (daySchedule === undefined) {
    return Promise.resolve([]);
  }

  // we use reduce instead of map to act as a map+filter in one pass
  const cleanedData = await daySchedule.reduce(async function (prevP, curr) {
    const prev = await prevP;
    const startDateTime = moment(dateObj);
    const endDateTime = moment(dateObj);

    startDateTime.hour(parseInt(curr.startHours));
    startDateTime.minute(parseInt(curr.startMinutes));
    startDateTime.second(0);
    endDateTime.hour(parseInt(curr.endHours));
    endDateTime.minute(parseInt(curr.endMinutes));
    endDateTime.second(0);

    if (startDateTime.hour() > endDateTime.hour()) {
      endDateTime.add(1, 'days');
    }

    let description = curr.chapo || '';

    let descriptionSupp = await fetchDesc(`${description_prefix}${curr.slug}`);

    if (utils.checkNested(descriptionSupp, 'description') === true && descriptionSupp.description.length > 0) {
      const descriptionAdd = descriptionSupp.description.join(' ').trim();
      if (descriptionAdd.length > 0) {
        description += ' ' + descriptionAdd;
      }
    }

    try {
      if (!descriptionSupp || descriptionSupp === ''
      || (utils.checkNested(descriptionSupp, 'description') === false || descriptionSupp.description.length === 0)) {
        descriptionSupp = await fetchDescAlt(`${description_prefix}${curr.slug}`);
        if (descriptionSupp && typeof descriptionSupp === 'object') {
          description += descriptionSupp.description || '';
        }
      }
    }
    catch (error) {
        // nothing
      }

    let img = null;

    try {
      img = curr.imagePrincipale.medias.find(element => element.format === '16by9');
      if (img !== undefined) {
        img = curr.imagePrincipale.medias.find(element => element.format === '16by9').url;
      }

      if (img === undefined && curr.imagePrincipale.medias.length > 0) {
        img = curr.imagePrincipale.medias[curr.imagePrincipale.medias.length - 1].url;
      }
    } catch (error) {
      // nothing
    }

    let host = null;
    if (hosts !== false) {
      if (curr.animatorsNames !== undefined && curr.animatorsNames !== null && curr.animatorsNames.length > 0) {
        host = curr.animatorsNames.join(', ');
      } else if (curr.chapo !== undefined && curr.chapo !== null && curr.chapo !== '' && curr.chapo !== description.substring(0, curr.chapo.length)) {
        host = curr.chapo.substring(5);
      }
    }

    const newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString(),
      'title': curr.title,
      'description': description || null,
      'img': img,
      'host': host,
      'sections': []
    };

    // should work be data differs from scrapped ? @todo check
    if (curr.chronicles && curr.chronicles.length > 0) {
      curr.chronicles.forEach(function (chronicle) {
        const startDateTime = moment(dateObj);

        startDateTime.hour(parseInt(chronicle.startHours));
        startDateTime.minute(parseInt(chronicle.startMinutes));
        startDateTime.second(0);

        let presenter = null;
        if (chronicle.animatorsNames !== undefined && chronicle.animatorsNames !== null && chronicle.animatorsNames.length > 0) {
          presenter = chronicle.animatorsNames.join(', ');
        }

        newEntry.sections.push(
          {
            date_time_start: startDateTime.toISOString(),
            title: chronicle.title,
            presenter: presenter
          }
        );
      });
    }

    prev.push(newEntry);

    return prev;
  }, []);

  return await Promise.resolve(cleanedData);
};

const fetch = async (url, name) => {
  logger.log('info', `fetching ${url}`);

  try {
    const $ = await fetchHtml(url);
    const json = $('script#__NEXT_DATA__').first().html();

    if (json) {
      scrapedData[name].push({ json });
    }
  } catch (error) {
    logger.log('error fetching schedule');
  }

  return Promise.resolve(true);
};

const fetchAll = (url, name) => {
  return fetch(url, name);
};

const getScrap = (dateObj, url, name, description_prefix, hosts) => {
  dateObj = moment(dateObj);
  dateObj.locale('fr');
  scrapedData[name] = [];
  return fetchAll(url, name)
    .then(() => {
      return format(dateObj, name, description_prefix, hosts);
    });
};

export default {
  getScrap,
  supportTomorrow: true,
};
