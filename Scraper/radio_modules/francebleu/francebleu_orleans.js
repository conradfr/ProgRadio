const scrapAbstract = require('./_abstract.js');

const name = 'francebleu_orleans';

const getScrap = dateObj => {
  const url = 'orleans';
  return scrapAbstract.getScrap(dateObj, url, name)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
