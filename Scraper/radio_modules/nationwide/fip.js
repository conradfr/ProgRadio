let moment = require('moment-timezone');

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
      'img': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/FIP_logo_2021.svg/2048px-FIP_logo_2021.svg.png',
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString()
    };

  const cleanedData = [newEntry];
  return Promise.resolve(cleanedData);
};

const getScrap = dateObj => {
  return format(dateObj);
};

const scrapModule = {
  getName: 'fip',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
