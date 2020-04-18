const scrapAbstract = require('./_abstract.js');

const name = 'francebleu_limousin';

const getScrap = dateObj => {
  const url = 'https://www.francebleu.fr/emissions/grille-programmes/limousin';
  return scrapAbstract.getScrap(dateObj, url, name)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
