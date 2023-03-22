const scrapAbstract = require('./_abstract.js');

const name = 'francebleu_bourgogne';

const getScrap = dateObj => {
  const url = 'bourgogne';
  return scrapAbstract.getScrap(dateObj, url, name)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
