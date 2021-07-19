const scrapAbstract = require('./_abstract_lesindes2.js');

const name = 'alouette';

const getScrap = dateObj => {
  const url = 'https://www.alouette.fr/emissions';
  const description_prefix = 'https://www.alouette.fr';
  return scrapAbstract.getScrap(dateObj, url, name, description_prefix);
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
