const scrapAbstract = require('./_abstract.js');

const name = 'francebleu_paysbasque';

const getScrap = dateObj => {
  const url = 'pays-basque';
  return scrapAbstract.getScrap(dateObj, url, name)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
