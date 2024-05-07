const scrapAbstract = require('./_abstract_lesindes2.js');

const name = 'africaradio';

const getScrap = dateObj => {
  dateObj.tz('GMT');
  const url = 'https://www.africaradio.com/emissions/1';
  const description_prefix = 'https://www.africaradio.com';
  return scrapAbstract.getScrap(dateObj, url, name, description_prefix)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
