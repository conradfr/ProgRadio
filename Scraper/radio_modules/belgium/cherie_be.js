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
      'title': 'Chérie la vie en musique',
      'description': "Branchez-vous dès maintenant sur Chérie Belgique pour chérir la vie en musique",
      'img': 'https://upload.wikimedia.org/wikipedia/fr/thumb/3/3a/Logo_Ch%C3%A9rie_2017.svg/1200px-Logo_Ch%C3%A9rie_2017.svg.png',
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
  logger.log('info', `fetching static Chérie Belgique`);

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
  dateObj.tz('Europe/Brussels');
  return fetchAll(dateObj)
    .then(() => {
      return format(dateObj);
    });
};

const scrapModule = {
  getName: 'cherie_be',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
