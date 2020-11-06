const scrapAbstract = require('./_abstract_rfi.js');

const name = 'rfi_afrique';

const getScrap = dateObj => {
  const url = 'https://www.rfi.fr/fr/grille-des-programmes-afrique';
  return scrapAbstract.getScrap(dateObj, name, url)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
