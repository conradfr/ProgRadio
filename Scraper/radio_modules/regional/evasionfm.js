const scrapAbstract = require('./_abstract_lesindes2.js');

const name = 'evasionfm';

const getScrap = dateObj => {
  const url = 'https://www.evasionfm.com/nos-emissions/1';
  const description_prefix = 'https://www.evasionfm.com';
  return scrapAbstract.getScrap(dateObj, url, name, description_prefix);
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
