const scrapAbstract = require('./_abstract_nrjgroup.js');

const name = 'nrj';
const url = 'https://www.nrj.fr/grille-emissions';

const getScrap = (dateObj) => {
  return scrapAbstract.getScrap(url, name, dateObj);
};

const scrapModule = {
  getName: name,
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
