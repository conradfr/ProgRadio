const scrapAbstract = require('./_abstract.js');

const name = 'francebleu_cotentin';

const getScrap = dateObj => {
  const url = 'cotentin';
  return scrapAbstract.getScrap(dateObj, url, name)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
