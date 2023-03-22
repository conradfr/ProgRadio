const scrapAbstract = require('./_abstract.js');

const name = 'francebleu_berry';

const getScrap = dateObj => {
  const url = 'berry';
  return scrapAbstract.getScrap(dateObj, url, name)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
