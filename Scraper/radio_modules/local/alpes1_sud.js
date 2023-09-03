const scrapAbstract = require('./_abstract_espacegroup');

const name = 'alpes1_sud';

const getScrap = dateObj => {
  const url = 'https://alpesdusud.alpes1.com/radio/grille-programme';
  return scrapAbstract.getScrap(dateObj, url, name)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
