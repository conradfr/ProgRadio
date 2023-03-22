const scrapAbstract = require('./_abstract.js');

const name = 'francebleu_loireocean';

const getScrap = dateObj => {
  const url = 'loire-ocean';
  return scrapAbstract.getScrap(dateObj, url, name)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
