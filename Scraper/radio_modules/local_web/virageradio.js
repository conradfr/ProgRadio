const scrapAbstract = require('./_abstract_espacegroup');

const name = 'virageradio';

const getScrap = dateObj => {
  const url = 'https://www.virageradio.com/radio/grille-programme';
  return scrapAbstract.getScrap(dateObj, url, name)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
