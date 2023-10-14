const scrapAbstract = require('./_abstract_rts.js');

const name = 'optionmusique';

const getScrap = dateObj => {
  const url = 'https://programmesradio.rts.ch/option-musique/';
  return scrapAbstract.getScrap(dateObj, url, name)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
