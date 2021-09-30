const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');
const utils = require('../../lib/utils');

let scrapedData = {};

const fetchDesc = async (url) => {
  let data = null;
  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .select('div:not(.Aside) > div[id*=paragraphe]')
      .set({
        'description': ['p']
      })
      .data(function(listing) {
        data = listing;
      })
      .done(function () {
        resolve(data);
      });
  });
};

const format = async (dateObj, name, description_prefix) => {
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

    let img = null;

    try {
      img  = curr.imagePrincipale.medias.find(element => element.format === '16by9').url;

      if (img === undefined && curr.imagePrincipale.medias.length > 0) {
        img = curr.imagePrincipale.medias[curr.imagePrincipale.medias.length - 1].url;
      }
    } catch (error) {
      // nothing
    }

    let host = null;
    if (curr.animatorsNames !== undefined && curr.animatorsNames !== null && curr.animatorsNames.length > 0) {
      host = curr.animatorsNames.join(', ');
    }

    newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString(),
      'title': curr.title,
      'description': description || null,
      'img': img,
      'host': host,
      'sections': []
    };

    // should work be data differs from scrapped ? @todo check
    if (curr.chronicles !== undefined && curr.chronicles !== null && curr.chronicles.length > 0) {
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

const fetch = (url, name, dateObj) => {
  logger.log('info', `fetching ${url}`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .set({
        'json': 'script#__NEXT_DATA__'
      })
      .data(function (listing) {
        scrapedData[name].push(listing);
      })
      .done(function () {
        resolve(true);
      })
  });
};

const fetchAll = (url, name, dateObj) => {
  return fetch(url, name, dateObj);
};

const getScrap = (dateObj, url, name, description_prefix) => {
  dateObj = moment(dateObj);
  dateObj.locale('fr');
  scrapedData[name] = [];
  return fetchAll(url, name, dateObj)
    .then(() => {
      return format(dateObj, name, description_prefix);
    });
};

const scrapModuleAbstract = {
  getScrap,
  supportTomorrow: true,
};

module.exports = scrapModuleAbstract;
