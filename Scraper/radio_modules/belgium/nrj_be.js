const scrapAbstract = require('./_abstract_nrj.js');

const name = 'nrj_be';
const url = 'https://www.nrj.be/grille';

const getScrap = (dateObj) => {
  return scrapAbstract.getScrap(url, name, dateObj);
};

const scrapModule = {
  getName: name,
  supportTomorrow: true,
  getScrap
};

module.exports = scrapModule;
