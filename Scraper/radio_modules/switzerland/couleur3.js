const scrapAbstract = require('./_abstract_rts.js');

const name = 'couleur3';

const getScrap = dateObj => {
  const url = 'https://programmesradio.rts.ch/couleur3/';
  return scrapAbstract.getScrap(dateObj, url, name)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
