const scrapAbstract = require('./_abstract_lesindes2.js');

const name = 'urbanhit';

const getScrap = dateObj => {
  const url = 'https://www.urbanhit.fr/emissions';
  const description_prefix = 'https://www.urbanhit.fr';
  return scrapAbstract.getScrap(dateObj, url, name, description_prefix);
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
