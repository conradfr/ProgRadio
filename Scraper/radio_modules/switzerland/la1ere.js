const scrapAbstract = require('./_abstract_rts.js');

const name = 'la1ere';

const getScrap = dateObj => {
  const url = 'https://programmesradio.rts.ch/la-1ere/';
  return scrapAbstract.getScrap(dateObj, url, name)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
