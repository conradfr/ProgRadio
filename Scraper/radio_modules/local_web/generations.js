const scrapAbstract = require('./_abstract_espacegroup');

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
