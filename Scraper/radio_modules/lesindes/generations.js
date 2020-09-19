const scrapAbstract = require('./_abstract_alpes1');

const name = 'generations';

const getScrap = dateObj => {
  const url = 'https://generations.fr/radio/grille-programme';
  return scrapAbstract.getScrap(dateObj, url, name)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
