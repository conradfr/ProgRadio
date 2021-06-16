const scrapAbstract = require('./_abstract_rtlgroup.js');

const name = 'rtl2';
const cutOffHour = 5;
const url = 'https://www.rtl2.fr/grille';

const getScrap = dateObj => {
  return scrapAbstract.getScrap(url, name, dateObj, cutOffHour);
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
