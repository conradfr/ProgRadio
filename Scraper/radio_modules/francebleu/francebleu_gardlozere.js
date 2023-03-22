const scrapAbstract = require('./_abstract.js');

const name = 'francebleu_gardlozere';

const getScrap = dateObj => {
  const url = 'gard-lozere';
  return scrapAbstract.getScrap(dateObj, url, name)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
