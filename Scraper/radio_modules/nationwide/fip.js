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
      'title': 'En direct sur FIP',
      'description': "Bienvenue sur Fip, la radio musicale la plus éclectique au monde ! Fip, c'est aussi l'actualité musicale : nouveautés, sorties d'albums, interviews, sessions live exclusives. Toute la musique est sur Fip !",
      'img': 'https://www.radiofrance.fr/sites/default/files/styles/format_32_9/public/2019-07/home%20fip.png.jpeg',
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
  logger.log('info', `fetching static fip`);

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
  getName: 'fip',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;



