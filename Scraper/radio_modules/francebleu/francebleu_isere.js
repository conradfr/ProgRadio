const scrapAbstract = require('./_abstract.js');

const name = 'francebleu_isere';

const getScrap = dateObj => {
  const url = 'isere';
  return scrapAbstract.getScrap(dateObj, url, name)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
