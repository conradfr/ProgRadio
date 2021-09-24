const scrapAbstract = require('./_abstract_lesindes2.js');

const name = 'beurfm';

const getScrap = dateObj => {
  const url = 'https://www.beurfm.net/emissions';
  const description_prefix = 'https://www.beurfm.net';
  return scrapAbstract.getScrap(dateObj, url, name, description_prefix);
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
