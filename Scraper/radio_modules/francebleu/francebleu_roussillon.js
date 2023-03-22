const scrapAbstract = require('./_abstract.js');

const name = 'francebleu_roussillon';

const getScrap = dateObj => {
  const url = 'roussillon';
  return scrapAbstract.getScrap(dateObj, url, name)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
