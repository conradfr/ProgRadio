let moment = require('moment-timezone');

const format = (dateObj, subRadio) => {
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
    'title': 'Info Trafic',
    'img': 'https://voyage.aprr.fr/sites/default/files/styles/logo_autoroute_info/public/2020-06/logo_autorouteinfo_light.png?itok=Bfmvf3EA',
    'date_time_start': startDateTime.toISOString(),
    'date_time_end': endDateTime.toISOString()
  };

  if (subRadio === 'autoroute_info_main') {
    newEntry.description = "Info trafic en temps réel, une fermeture sur l'autoroute A43 dans le secteur de Lyon. Un obstacle sur l'autoroute A48 direction Grenoble dans le département de l'Isère. Ecoutez notre dernier flash mobilité ...";
  } else if (subRadio === 'autoroute_info_centre_est') {
    newEntry.description = "Info trafic de dernière minute, un obstacle sur l'autoroute A77 direction Nevers dans le département du Loiret. Un véhicule en panne sur l'autoroute A6 direction Lyon dans le secteur de Beaune. Un véhicule en panne sur l'autoroute A6 direction Lyon dans le département de la Seine et Marne. Pour tout connaître de vos conditions de circulation, écoutez le dernier flash trafic ...";
  } else {
    newEntry.description = "Toutes les infos circulation sur votre route, en écoutant le flash trafic ...";
  }

  const cleanedData = [newEntry];
  return Promise.resolve(cleanedData);
};

const getScrap = (dateObj, subRadio) => {
  return format(dateObj, subRadio);
};

const scrapModule = {
  getName: 'autoroute_info',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
