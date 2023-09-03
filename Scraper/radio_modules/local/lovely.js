let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');

const format = dateObj => {
    let startDateTime = moment(dateObj);
    startDateTime.hour(0);
    startDateTime.minute(0);
    startDateTime.second(0);

    let endDateTime = moment(dateObj);
    endDateTime.hour(0);
    endDateTime.minute(0);
    endDateTime.second(0);
    endDateTime.add(1, 'days');

    const newEntry = {
      'title': 'Hits & Golds',
      'description': "Points info trafic détaillés (toutes les ½ heures le matin et le soir), de l'information locale, des bons plans sorties, des jeux de proximité, de la musique Hit and Gold.",
      'img': 'https://images.lesindesradios.fr/fit-in/300x2000/filters:quality(100)/radios/lovely/images/logo.png',
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString()
      // 'sections': subs
    };

  const cleanedData = [newEntry];
  return Promise.resolve(cleanedData);
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const fetch = dateObj => {
  logger.log('info', `fetching static lovely`);

  // For some reason we need to have a sleep otherwise save in redis fails
  return new Promise((resolve, reject) => {
    sleep(3000).then(() => {
      resolve(true);
    });
  });
};

const fetchAll = dateObj =>  {
  return fetch(dateObj);
};

const getScrap = dateObj => {
  return fetchAll(dateObj)
    .then(() => {
      return format(dateObj);
    });
};

const scrapModule = {
  getName: 'lovely',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
