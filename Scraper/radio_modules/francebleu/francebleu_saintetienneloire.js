const scrapAbstract = require('./_abstract.js');

const name = 'francebleu_saintetienneloire';

const getScrap = dateObj => {
  const url = 'https://www.francebleu.fr/emissions/grille-programmes/saint-etienne-loire';
  return scrapAbstract.getScrap(dateObj, url, name)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
