const scrapAbstract = require('./_abstract.js');

const name = 'francebleu_lorrainenord';

const getScrap = dateObj => {
  const url = 'lorraine-nord';
  return scrapAbstract.getScrap(dateObj, url, name)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
