const scrapAbstract = require('./_abstract_nrjgroup.js');

const name = 'cherie';
const url = 'https://www.cheriefm.fr/grille-emissions';

const getScrap = (dateObj) => {
  return scrapAbstract.getScrap(url, name, dateObj);
};

const scrapModule = {
  getName: name,
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
