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
      'title': 'Informer, former, accompagner',
      'description': "707.7FM - La priorité de Radio VINCI Autoroutes est de contribuer au confort et à la sécurité de ses auditeurs en les informant avec le maximum de précision et de réactivité sur leurs conditions de circulation.",
      'img': 'https://upload.wikimedia.org/wikipedia/fr/thumb/7/7f/Logo_radio_vinci_autoroutes.svg/494px-Logo_radio_vinci_autoroutes.svg.png',
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString()
      // 'sections': subs
    };

  const cleanedData = [newEntry];
  return Promise.resolve(cleanedData);
};

const getScrap = (dateObj) => {
  return format(dateObj);
};

const scrapModule = {
  getName: 'radio_vinci_autoroutes',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
