const scrapAbstract = require('./_abstract_rtlgroup.js');

const name = 'rtl';
const cutOffHour = 4;
const url = 'https://www.rtl.fr/grille';

const getScrap = dateObj => {
  return scrapAbstract.getScrap(url, name, dateObj, cutOffHour);
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
