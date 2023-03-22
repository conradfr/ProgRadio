const scrapAbstract = require('./_abstract.js');

const name = 'francebleu_besancon';

const getScrap = dateObj => {
  const url = 'besancon';
  return scrapAbstract.getScrap(dateObj, url, name)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
