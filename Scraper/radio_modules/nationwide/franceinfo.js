const scrapAbstract = require('./_abstract_radiofrance.js');

const name = 'franceinfo';

const getScrap = dateObj => {
  return scrapAbstract.getScrap(name, dateObj);
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
