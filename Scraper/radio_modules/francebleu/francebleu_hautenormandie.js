const scrapAbstract = require('./_abstract.js');

const name = 'francebleu_hautenormandie';

const getScrap = dateObj => {
  const url = 'normandie-rouen';
  return scrapAbstract.getScrap(dateObj, url, name)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
