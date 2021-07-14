const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');
const utils = require('../../lib/utils');

let scrapedData = [];

const fetchDesc = async (url) => {
  let data = null;
  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .select('#emissionProgrammation + .block.paragraph')
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

const format = async dateObj => {
  if (scrapedData === undefined || scrapedData[0] === undefined || scrapedData[0].json === 'undefined') {
    return Promise.resolve([]);
  }

  let schedule = null;

  try {
    const content = JSON.parse(scrapedData[0].json);
    schedule = content.props.pageProps.fetchedContent;

    if (Object.keys(schedule)[0].startsWith('grilleDesProgrammes') === false) {
      return Promise.resolve([]);
    } else {
      schedule = schedule[Object.keys(schedule)[0]]['programmation'];
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

    let description = curr.chapo;
    let descriptionSupp = await fetchDesc(`https://www.alouette.fr${curr.slug}`);

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

    newEntry = {
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString(),
      'title': curr.title,
      'description': description || null,
      'img': img,
      // 'host': curr.animatorsNames !== null ? curr.animatorsNames.join(', ') : null
    };

    prev.push(newEntry);

    return prev;
  }, []);

  return await Promise.resolve(cleanedData);
};

const fetch = dateObj => {
  let url = 'https://www.alouette.fr/emissions';

  logger.log('info', `fetching ${url}`);

  return new Promise(function (resolve, reject) {
    return osmosis
      .get(url)
      .set({
        'json': 'script#__NEXT_DATA__'
      })
      .data(function (listing) {
        scrapedData.push(listing);
      })
      .done(function () {
        resolve(true);
      })
  });
};

const fetchAll = dateObj => {
  return fetch(dateObj);
};

const getScrap = dateObj => {
  dateObj = moment(dateObj);
  dateObj.locale('fr');
  return fetchAll(dateObj)
    .then(() => {
      return format(dateObj);
    });
};

const scrapModule = {
  getName: 'alouette',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
