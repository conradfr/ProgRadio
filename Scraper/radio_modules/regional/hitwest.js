const scrapAbstract = require('./_abstract.js');

const name = 'hitwest';

const getScrap = dateObj => {
  const url = 'https://www.hitwest.com/emissions';
  const img_prefix = 'https://www.hitwest.com/';
  return scrapAbstract.getScrap(dateObj, url, name, img_prefix)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
