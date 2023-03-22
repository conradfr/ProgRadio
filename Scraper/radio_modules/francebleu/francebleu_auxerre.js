const scrapAbstract = require('./_abstract.js');

const name = 'francebleu_auxerre';

const getScrap = dateObj => {
  const url = 'auxerre';
  return scrapAbstract.getScrap(dateObj, url, name)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
