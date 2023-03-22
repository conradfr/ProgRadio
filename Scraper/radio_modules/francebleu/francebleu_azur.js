const scrapAbstract = require('./_abstract.js');

const name = 'francebleu_azur';

const getScrap = dateObj => {
  const url = 'azur';
  return scrapAbstract.getScrap(dateObj, url, name)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
