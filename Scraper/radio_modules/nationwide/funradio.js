const scrapAbstract = require('./_abstract_rtlgroup.js');

const name = 'funradio';
const cutOffHour = 6;
const url = 'https://www.funradio.fr/grille';

const getScrap = dateObj => {
  return scrapAbstract.getScrap(url, name, dateObj, cutOffHour);
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
