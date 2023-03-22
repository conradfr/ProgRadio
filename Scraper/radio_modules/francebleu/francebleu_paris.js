const scrapAbstract = require('./_abstract.js');

const name = 'francebleu_paris';

const getScrap = dateObj => {
  const url = '107-1';
  return scrapAbstract.getScrap(dateObj, url, name)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
