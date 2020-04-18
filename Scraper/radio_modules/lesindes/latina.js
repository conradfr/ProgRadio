const scrapAbstract = require('./_abstract.js');

const name = 'latina';

const getScrap = dateObj => {
  const url = 'https://www.latina.fr/programs';
  const img_prefix = 'https://www.latina.fr';
  return scrapAbstract.getScrap(dateObj, url, name, img_prefix)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
