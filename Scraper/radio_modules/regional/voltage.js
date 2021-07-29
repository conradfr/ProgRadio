const scrapAbstract = require('./_abstract_lesindes2.js');

const name = 'voltage';

const getScrap = dateObj => {
  const url = 'https://www.voltage.fr/emissions';
  const description_prefix = 'https://www.voltage.fr';
  return scrapAbstract.getScrap(dateObj, url, name, description_prefix);
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
