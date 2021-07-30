const scrapAbstract = require('./_abstract_lesindes2.js');

const name = 'forum';

const getScrap = dateObj => {
  const url = 'https://www.forum.fr/emissions';
  const description_prefix = 'https://www.forum.fr';
  return scrapAbstract.getScrap(dateObj, url, name, description_prefix);
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
