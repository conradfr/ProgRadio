const scrapAbstract = require('./_abstract_1ere.js');
const moment = require('moment-timezone');

const name = 'martinique_la1ere';

const getScrap = dateObj => {
  const dateWantedObj = moment(dateObj);

  dateObj.tz('America/Martinique');

  const url = 'https://la1ere.francetvinfo.fr/martinique/programme-audio/';
  return scrapAbstract.getScrap(dateObj, dateWantedObj, name, url)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
