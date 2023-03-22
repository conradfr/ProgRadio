const scrapAbstract = require('./_abstract.js');

const name = 'francebleu_larochelle';

const getScrap = dateObj => {
  const url = 'la-rochelle';
  return scrapAbstract.getScrap(dateObj, url, name)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
