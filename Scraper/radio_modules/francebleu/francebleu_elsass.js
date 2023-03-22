const scrapAbstract = require('./_abstract.js');

const name = 'francebleu_elsass';

const getScrap = dateObj => {
  const url = 'elsass';
  return scrapAbstract.getScrap(dateObj, url, name)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
