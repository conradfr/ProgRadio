const scrapAbstract = require('./_abstract_lesindes2.js');

const name = 'latina';

const getScrap = dateObj => {
  const url = 'https://www.latina.fr/emissions';
  const description_prefix = 'https://www.latina.fr';
  return scrapAbstract.getScrap(dateObj, url, name, description_prefix);
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
