const scrapAbstract = require('../regional/_abstract_lesindes.js');

const name = 'blackbox';

const getScrap = dateObj => {
  const url = 'https://www.blackboxfm.fr/programs';
  const img_prefix = 'https://www.blackboxfm.fr';
  return scrapAbstract.getScrap(dateObj, url, name, img_prefix)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
