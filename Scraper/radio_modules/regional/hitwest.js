const scrapAbstract = require('./_abstract_lesindes2.js');

const name = 'hitwest';

const getScrap = dateObj => {
  const url = 'https://hitwest.ouest-france.fr/emissions';
  const description_prefix = 'https://hitwest.ouest-france.fr';
  return scrapAbstract.getScrap(dateObj, url, name, description_prefix);
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
