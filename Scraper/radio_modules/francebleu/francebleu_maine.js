const scrapAbstract = require('./_abstract.js');

const name = 'francebleu_maine';

const getScrap = dateObj => {
  const url = 'maine';
  return scrapAbstract.getScrap(dateObj, url, name)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
