const scrapAbstract = require('./_abstract.js');

const name = 'francebleu_champagneardenne';

const getScrap = dateObj => {
  const url = 'https://www.francebleu.fr/emissions/grille-programmes/champagne-ardenne';
  return scrapAbstract.getScrap(dateObj, url, name)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
