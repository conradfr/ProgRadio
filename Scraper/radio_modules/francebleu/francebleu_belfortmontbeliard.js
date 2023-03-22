const scrapAbstract = require('./_abstract.js');

const name = 'francebleu_belfortmontbeliard';

const getScrap = dateObj => {
  const url = 'belfort-montbeliard';
  return scrapAbstract.getScrap(dateObj, url, name)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
