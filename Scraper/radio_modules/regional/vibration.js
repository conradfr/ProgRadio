const scrapAbstract = require('./_abstract_lesindes2.js');

const name = 'vibration';

const getScrap = dateObj => {
  const url = 'https://www.vibration.fr/emissions/1';
  const description_prefix = 'https://www.vibration.fr';
  return scrapAbstract.getScrap(dateObj, url, name, description_prefix);
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
