const scrapAbstract = require('./_abstract.js');

const name = 'francebleu_mayenne';

const getScrap = dateObj => {
  const url = 'mayenne';
  return scrapAbstract.getScrap(dateObj, url, name)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
