const scrapAbstract = require('./_abstract_lesindes2.js');

const name = 'goldfm';

const getScrap = dateObj => {
  const url = 'https://www.goldfm.fr/emissions';
  const description_prefix = 'https://www.goldfm.fr';
  return scrapAbstract.getScrap(dateObj, url, name, description_prefix);
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
