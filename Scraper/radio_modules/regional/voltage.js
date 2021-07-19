const scrapAbstract = require('./_abstract_lesindes.js');

const name = 'voltage';

const getScrap = dateObj => {
  const url = 'https://www.voltage.fr/programs';
  const img_prefix = 'https://www.voltage.fr';
  return scrapAbstract.getScrap(dateObj, url, name, img_prefix)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
