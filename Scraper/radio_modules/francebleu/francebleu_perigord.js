const scrapAbstract = require('./_abstract.js');

const name = 'francebleu_perigord';

const getScrap = dateObj => {
  const url = 'perigord';
  return scrapAbstract.getScrap(dateObj, url, name)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
