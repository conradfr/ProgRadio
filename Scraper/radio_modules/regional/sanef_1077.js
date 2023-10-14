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
      'title': 'Sanef 107.7, la Radio qui Vous fait Voyager',
      'img': 'https://www.sanef.com/sites/default/files/2023-01/SANEF1077_Carre_magenta.png',
      'date_time_start': startDateTime.toISOString(),
      'date_time_end': endDateTime.toISOString()
      // 'sections': subs
    };

    if (subRadio === 'sanef_1077_main') {
      newEntry.description = "Sanef 107.7 Ile-de-France : l’info trafic détaillée en région parisienne disponible sur la FM et le DAB +. Difficultés sur les routes et dans les transports en commun en Ile-de-France.";
    } else {
      newEntry.description = "Sanef 107.7 Régions : l’info trafic en temps réel sur les autoroutes de Normandie, des Hauts-de-France et du Grand-Est.";
    }

  const cleanedData = [newEntry];
  return Promise.resolve(cleanedData);
};

const getScrap = (dateObj, subRadio) => {
  return format(dateObj, subRadio);
};

const scrapModule = {
  getName: 'sanef_1077',
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
