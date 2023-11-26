const scrapAbstract = require('../regional/_abstract_lesindes2');

const name = 'ouifm';

const getScrap = dateObj => {
  const url = 'https://www.ouifm.fr/emissions/1';
  const description_prefix = 'https://www.ouifm.fr';
  return scrapAbstract.getScrap(dateObj, url, name, description_prefix);
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
