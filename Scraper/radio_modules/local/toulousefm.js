const scrapAbstract = require('../regional/_abstract_lesindes2.js');

const name = 'toulousefm';

const getScrap = dateObj => {
  const url = 'https://www.toulouse.fm/grille-des-programmes';
  const description_prefix = 'https://www.toulouse.fm/';
  return scrapAbstract.getScrap(dateObj, url, name, description_prefix);
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
