let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');

const cleanedData = [];

const format = dateObj => {
  dateObj.tz('Indian/Reunion');
  const dayNum = dateObj.isoWeekday();

  let newEntry = {};

  // Brace yourself, I brute force
  // Because Freedom schedule page is IMAGES for some reasons ffs

  // semaine

  if (dayNum !== 6 && dayNum !== 7) {
    startDateTime = moment(dateObj);
    startDateTime.hour(5);
    startDateTime.minute(0);
    startDateTime.second(0);

    newEntry = {
      'title': 'Libre antenne',
      'description': 'Vos histoires de vie, vos appels, vos réactions au 0262 99 12 00',
      'date_time_start': startDateTime.toISOString(),
    };

    cleanedData.push(newEntry);

    startDateTime = moment(dateObj);
    startDateTime.hour(5);
    startDateTime.minute(50);
    startDateTime.second(0);

    newEntry = {
      'title': 'Les avis de décès',
      'date_time_start': startDateTime.toISOString(),
    };

    cleanedData.push(newEntry);

    startDateTime = moment(dateObj);
    startDateTime.hour(6);
    startDateTime.minute(30);
    startDateTime.second(0);

    newEntry = {
      'title': 'La revue de presse locale',
      'date_time_start': startDateTime.toISOString(),
    };

    cleanedData.push(newEntry);

    startDateTime = moment(dateObj);
    startDateTime.hour(7);
    startDateTime.minute(40);
    startDateTime.second(0);

    newEntry = {
      'title': 'Baromètre',
      'description': "Donnez votre avis sur un sujet d'actualité ou de société au 0262 99 12 00",
      'date_time_start': startDateTime.toISOString(),
    };

    cleanedData.push(newEntry);

    startDateTime = moment(dateObj);
    startDateTime.hour(8);
    startDateTime.minute(30);
    startDateTime.second(0);

    newEntry = {
      'title': 'La revue de presse locale',
      'date_time_start': startDateTime.toISOString(),
    };

    cleanedData.push(newEntry);

    startDateTime = moment(dateObj);
    startDateTime.hour(8);
    startDateTime.minute(50);
    startDateTime.second(0);

    newEntry = {
      'title': 'Les avis de décès',
      'date_time_start': startDateTime.toISOString(),
    };

    cleanedData.push(newEntry);

    startDateTime = moment(dateObj);
    startDateTime.hour(9);
    startDateTime.minute(0);
    startDateTime.second(0);

    newEntry = {
      'title': 'La matinale',
      'host': 'Francky',
      'description': "Réveillez-vous avec Free Dom, le décryptage de l'info péi, la météo, du rire, des débats, des jeux, vos anniversaires et plus encore !",
      'date_time_start': startDateTime.toISOString(),
    };

    cleanedData.push(newEntry);

    startDateTime = moment(dateObj);
    startDateTime.hour(10);
    startDateTime.minute(0);
    startDateTime.second(0);

    newEntry = {
      'title': 'Libre antenne',
      'description': 'Vos histoires de vie, vos appels, vos réactions au 0262 99 12 00',
      'date_time_start': startDateTime.toISOString(),
    };

    cleanedData.push(newEntry);

    startDateTime = moment(dateObj);
    startDateTime.hour(12);
    startDateTime.minute(15);
    startDateTime.second(0);

    newEntry = {
      'title': 'Les avis de décès',
      'date_time_start': startDateTime.toISOString(),
    };

    cleanedData.push(newEntry);

    startDateTime = moment(dateObj);
    startDateTime.hour(12);
    startDateTime.minute(30);
    startDateTime.second(0);

    newEntry = {
      'title': 'La revue de presse locale',
      'date_time_start': startDateTime.toISOString(),
    };

    cleanedData.push(newEntry);

    startDateTime = moment(dateObj);
    startDateTime.hour(12);
    startDateTime.minute(46);
    startDateTime.second(0);

    newEntry = {
      'title': 'Libre antenne',
      'description': 'Vos histoires de vie, vos appels, vos réactions au 0262 99 12 00',
      'date_time_start': startDateTime.toISOString(),
    };

    cleanedData.push(newEntry);

    startDateTime = moment(dateObj);
    startDateTime.hour(16);
    startDateTime.minute(50);
    startDateTime.second(0);

    newEntry = {
      'title': 'Les avis de décès',
      'date_time_start': startDateTime.toISOString(),
    };

    cleanedData.push(newEntry);

    startDateTime = moment(dateObj);
    startDateTime.hour(17);
    startDateTime.minute(0);
    startDateTime.second(0);

    newEntry = {
      'title': 'Droit de parole',
      'host': 'Madame Aude',
      'description': "Posez vos questions à Madame Aude et ses invités, au 0232 99 12 00",
      'date_time_start': startDateTime.toISOString(),
    };

    cleanedData.push(newEntry);

    startDateTime = moment(dateObj);
    startDateTime.hour(18);
    startDateTime.minute(0);
    startDateTime.second(0);

    newEntry = {
      'title': 'Libre antenne',
      'description': 'Vos histoires de vie, vos appels, vos réactions au 0262 99 12 00',
      'date_time_start': startDateTime.toISOString(),
    };

    cleanedData.push(newEntry);

    startDateTime = moment(dateObj);
    startDateTime.hour(19);
    startDateTime.minute(0);
    startDateTime.second(0);

    newEntry = {
      'title': 'Les petites annonces',
      'description': 'Vendez, achetez, louez, retrouvez vos objets perdus en direct.',
      'date_time_start': startDateTime.toISOString(),
    };

    cleanedData.push(newEntry);

    startDateTime = moment(dateObj);
    startDateTime.hour(20);
    startDateTime.minute(0);
    startDateTime.second(0);

    let endDateTime = moment(dateObj);
    endDateTime.hour(0);
    endDateTime.minute(0);
    endDateTime.second(0);
    endDateTime.add(1, 'days');

    newEntry = {
      'title': 'Chaleur tropicale',
      'description': "Vos rencontre en direct, à la radio de 20h à minuit (et aussi sur internet: www.chaleurtropicale.fr)",
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString(),
    };

    cleanedData.push(newEntry);
  }

  // samedi
  if (dayNum === 6) {
    startDateTime = moment(dateObj);
    startDateTime.hour(5);
    startDateTime.minute(50);
    startDateTime.second(0);

    newEntry = {
      'title': 'Les avis de décès',
      'date_time_start': startDateTime.toISOString(),
    };

    cleanedData.push(newEntry);

    startDateTime = moment(dateObj);
    startDateTime.hour(6);
    startDateTime.minute(0);
    startDateTime.second(0);

    newEntry = {
      'title': 'Libre antenne',
      'description': 'Vos histoires de vie, vos appels, vos réactions au 0262 99 12 00',
      'date_time_start': startDateTime.toISOString(),
    };

    cleanedData.push(newEntry);

    startDateTime = moment(dateObj);
    startDateTime.hour(6);
    startDateTime.minute(30);
    startDateTime.second(0);

    newEntry = {
      'title': 'Journal local',
      'host': 'Charles Luylier',
      'img': 'https://s3.eu-central-1.wasabisys.com/monbucket4/2021/07/FD_HOME_journal_1200x300_C.LUYLIER.jpg',
      'date_time_start': startDateTime.toISOString(),
    };

    cleanedData.push(newEntry);

    startDateTime = moment(dateObj);
    startDateTime.hour(8);
    startDateTime.minute(30);
    startDateTime.second(0);

    newEntry = {
      'title': 'La revue de presse locale',
      'date_time_start': startDateTime.toISOString(),
    };

    cleanedData.push(newEntry);

    startDateTime = moment(dateObj);
    startDateTime.hour(8);
    startDateTime.minute(50);
    startDateTime.second(0);

    newEntry = {
      'title': 'Les avis de décès',
      'date_time_start': startDateTime.toISOString(),
    };

    cleanedData.push(newEntry);

    startDateTime = moment(dateObj);
    startDateTime.hour(10);
    startDateTime.minute(0);
    startDateTime.second(0);

    newEntry = {
      'title': 'Libre antenne',
      'description': 'Vos histoires de vie, vos appels, vos réactions au 0262 99 12 00',
      'date_time_start': startDateTime.toISOString(),
    };

    cleanedData.push(newEntry);

    startDateTime = moment(dateObj);
    startDateTime.hour(12);
    startDateTime.minute(15);
    startDateTime.second(0);

    newEntry = {
      'title': 'Les avis de décès',
      'date_time_start': startDateTime.toISOString(),
    };

    cleanedData.push(newEntry);

    startDateTime = moment(dateObj);
    startDateTime.hour(12);
    startDateTime.minute(25);
    startDateTime.second(0);

    newEntry = {
      'title': 'La revue de presse locale',
      'date_time_start': startDateTime.toISOString(),
    };

    cleanedData.push(newEntry);

    startDateTime = moment(dateObj);
    startDateTime.hour(12);
    startDateTime.minute(46);
    startDateTime.second(0);

    newEntry = {
      'title': 'Libre antenne',
      'description': 'Vos histoires de vie, vos appels, vos réactions au 0262 99 12 00',
      'date_time_start': startDateTime.toISOString(),
    };

    cleanedData.push(newEntry);

    startDateTime = moment(dateObj);
    startDateTime.hour(16);
    startDateTime.minute(50);
    startDateTime.second(0);

    newEntry = {
      'title': 'Les avis de décès',
      'date_time_start': startDateTime.toISOString(),
    };

    cleanedData.push(newEntry);

    startDateTime = moment(dateObj);
    startDateTime.hour(18);
    startDateTime.minute(0);
    startDateTime.second(0);

    newEntry = {
      'title': 'Libre antenne',
      'description': 'Vos histoires de vie, vos appels, vos réactions au 0262 99 12 00',
      'date_time_start': startDateTime.toISOString(),
    };

    cleanedData.push(newEntry);

    startDateTime = moment(dateObj);
    startDateTime.hour(19);
    startDateTime.minute(0);
    startDateTime.second(0);

    newEntry = {
      'title': 'Les petites annonces',
      'description': 'Vendez, achetez, louez, retrouvez vos objets perdus en direct.',
      'date_time_start': startDateTime.toISOString(),
    };

    cleanedData.push(newEntry);

    startDateTime = moment(dateObj);
    startDateTime.hour(20);
    startDateTime.minute(0);
    startDateTime.second(0);

    let endDateTime = moment(dateObj);
    endDateTime.hour(0);
    endDateTime.minute(0);
    endDateTime.second(0);
    endDateTime.add(1, 'days');

    newEntry = {
      'title': 'Chaleur tropicale',
      'description': "Vos rencontre en direct, à la radio de 20h à minuit (et aussi sur internet: www.chaleurtropicale.fr)",
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString(),
    };

    cleanedData.push(newEntry);
  }

  // dimanche

  if (dayNum === 7) {
    let startDateTime = moment(dateObj);
    startDateTime.hour(6);
    startDateTime.minute(0);
    startDateTime.second(0);

    newEntry = {
      'title': 'Libre antenne',
      'description': 'Vos histoires de vie, vos appels, vos réactions au 0262 99 12 00',
      'date_time_start': startDateTime.toISOString(),
    };

    cleanedData.push(newEntry);

    startDateTime = moment(dateObj);
    startDateTime.hour(6);
    startDateTime.minute(30);
    startDateTime.second(0);

    newEntry = {
      'title': 'La revue de presse locale',
      'date_time_start': startDateTime.toISOString(),
    };

    cleanedData.push(newEntry);

    startDateTime = moment(dateObj);
    startDateTime.hour(8);
    startDateTime.minute(50);
    startDateTime.second(0);

    newEntry = {
      'title': 'Les avis de décès',
      'date_time_start': startDateTime.toISOString(),
    };

    cleanedData.push(newEntry);

    startDateTime = moment(dateObj);
    startDateTime.hour(10);
    startDateTime.minute(0);
    startDateTime.second(0);

    newEntry = {
      'title': 'Libre antenne',
      'description': 'Vos histoires de vie, vos appels, vos réactions au 0262 99 12 00',
      'date_time_start': startDateTime.toISOString(),
    };

    cleanedData.push(newEntry);

    startDateTime = moment(dateObj);
    startDateTime.hour(12);
    startDateTime.minute(15);
    startDateTime.second(0);

    newEntry = {
      'title': 'Les avis de décès',
      'date_time_start': startDateTime.toISOString(),
    };

    cleanedData.push(newEntry);

    startDateTime = moment(dateObj);
    startDateTime.hour(12);
    startDateTime.minute(46);
    startDateTime.second(0);

    newEntry = {
      'title': 'Libre antenne',
      'description': 'Vos histoires de vie, vos appels, vos réactions au 0262 99 12 00',
      'date_time_start': startDateTime.toISOString(),
    };

    cleanedData.push(newEntry);

    startDateTime = moment(dateObj);
    startDateTime.hour(14);
    startDateTime.minute(0);
    startDateTime.second(0);

    newEntry = {
      'title': 'Dédicaces',
      'description': 'Appelez et demandez une chanson aen direct au vos réactions au 0262 99 14 00',
      'date_time_start': startDateTime.toISOString(),
    };

    cleanedData.push(newEntry);

    startDateTime = moment(dateObj);
    startDateTime.hour(15);
    startDateTime.minute(0);
    startDateTime.second(0);

    newEntry = {
      'title': 'Libre antenne',
      'description': 'Vos histoires de vie, vos appels, vos réactions au 0262 99 12 00',
      'date_time_start': startDateTime.toISOString(),
    };

    cleanedData.push(newEntry);

    startDateTime = moment(dateObj);
    startDateTime.hour(16);
    startDateTime.minute(0);
    startDateTime.second(0);

    newEntry = {
      'title': 'Dimanche foot',
      'description': 'Le suivi des matches de la Réunion en direct des stades.',
      'date_time_start': startDateTime.toISOString(),
    };

    cleanedData.push(newEntry);

    startDateTime = moment(dateObj);
    startDateTime.hour(16);
    startDateTime.minute(50);
    startDateTime.second(0);

    newEntry = {
      'title': 'Les avis de décès',
      'date_time_start': startDateTime.toISOString(),
    };

    cleanedData.push(newEntry);

    startDateTime = moment(dateObj);
    startDateTime.hour(20);
    startDateTime.minute(0);
    startDateTime.second(0);

    let endDateTime = moment(dateObj);
    endDateTime.hour(0);
    endDateTime.minute(0);
    endDateTime.second(0);
    endDateTime.add(1, 'days');

    newEntry = {
      'title': 'Chaleur tropicale',
      'description': "Vos rencontre en direct, à la radio de 20h à minuit (et aussi sur internet: www.chaleurtropicale.fr)",
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString(),
    };

    cleanedData.push(newEntry);
  }

  return Promise.resolve(cleanedData);
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const fetch = dateObj => {
  logger.log('info', `fetching static Free Dom`);

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
  getName: 'freedom',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
