const scrapAbstract = require('./_abstract.js');

const name = 'francebleu_touraine';

const getScrap = dateObj => {
  const url = 'touraine';
  return scrapAbstract.getScrap(dateObj, url, name)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
