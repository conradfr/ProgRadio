const scrapAbstract = require('./_abstract_rts.js');

const name = 'espace2';

const getScrap = dateObj => {
  const url = 'https://programmesradio.rts.ch/espace-2/';
  return scrapAbstract.getScrap(dateObj, url, name)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
