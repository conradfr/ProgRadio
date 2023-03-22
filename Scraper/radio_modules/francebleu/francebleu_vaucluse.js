const scrapAbstract = require('./_abstract.js');

const name = 'francebleu_vaucluse';

const getScrap = dateObj => {
  const url = 'vaucluse';
  return scrapAbstract.getScrap(dateObj, url, name)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
