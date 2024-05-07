const scrapAbstract = require('../regional/_abstract_lesindes2.js');

const name = 'chantefrance';

const getScrap = dateObj => {
  const url = 'https://www.chantefrance.com/nos-emissions/1';
  const description_prefix = 'https://www.chantefrance.com/';
  return scrapAbstract.getScrap(dateObj, url, name, description_prefix);
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
