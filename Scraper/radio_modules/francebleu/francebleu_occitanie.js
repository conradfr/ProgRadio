const scrapAbstract = require('./_abstract.js');

const name = 'francebleu_occitanie';

const getScrap = dateObj => {
  const url = 'toulouse';
  return scrapAbstract.getScrap(dateObj, url, name)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
