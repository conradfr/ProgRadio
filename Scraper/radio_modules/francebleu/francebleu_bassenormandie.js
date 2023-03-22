const scrapAbstract = require('./_abstract.js');

const name = 'francebleu_bassenormandie';

const getScrap = dateObj => {
  const url = 'normandie-caen';
  return scrapAbstract.getScrap(dateObj, url, name)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
