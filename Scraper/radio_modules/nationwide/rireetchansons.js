const scrapAbstract = require('./_abstract_nrjgroup.js');

const name = 'rireetchansons';
const url = 'https://www.rireetchansons.fr/grille-emissions';

const getScrap = (dateObj) => {
  return scrapAbstract.getScrap(url, name, dateObj);
};

const scrapModule = {
  getName: name,
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
