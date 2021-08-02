const scrapAbstract = require('../regional/_abstract_lesindes2.js');

const name = 'blackbox';

const getScrap = dateObj => {
  const url = 'https://www.blackboxfm.fr/emissions';
  const description_prefix = 'https://www.blackboxfm.fr';
  return scrapAbstract.getScrap(dateObj, url, name, description_prefix);
};


const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
