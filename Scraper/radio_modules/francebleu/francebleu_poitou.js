const scrapAbstract = require('./_abstract.js');

const name = 'francebleu_poitou';

const getScrap = dateObj => {
  const url = 'poitou';
  return scrapAbstract.getScrap(dateObj, url, name)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
