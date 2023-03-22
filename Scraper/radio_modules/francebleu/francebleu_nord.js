const scrapAbstract = require('./_abstract.js');

const name = 'francebleu_nord';

const getScrap = dateObj => {
  const url = 'nord';
  return scrapAbstract.getScrap(dateObj, url)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
