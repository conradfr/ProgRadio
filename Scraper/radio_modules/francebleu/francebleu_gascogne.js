const scrapAbstract = require('./_abstract.js');

const name = 'francebleu_gascogne';

const getScrap = dateObj => {
  const url = 'gascogne';
  return scrapAbstract.getScrap(dateObj, url, name)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
