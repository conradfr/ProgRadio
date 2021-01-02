const scrapAbstract = require('./_abstract.js');

const name = 'forum';

const getScrap = dateObj => {
  const url = 'https://www.forum.fr/programs';
  const img_prefix = 'https://www.forum.fr';
  return scrapAbstract.getScrap(dateObj, url, name, img_prefix)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
