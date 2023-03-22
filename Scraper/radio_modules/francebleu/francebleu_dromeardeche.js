const scrapAbstract = require('./_abstract.js');

const name = 'francebleu_dromeardeche';

const getScrap = dateObj => {
  const url = 'drome-ardeche';
  return scrapAbstract.getScrap(dateObj, url, name)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
