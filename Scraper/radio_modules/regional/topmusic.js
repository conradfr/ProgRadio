const scrapAbstract = require('./_abstract_lesindes2.js');

const name = 'topmusic';

const getScrap = dateObj => {
  const url = 'https://www.topmusic.fr/radio/1';
  const description_prefix = 'https://www.topmusic.fr';
  return scrapAbstract.getScrap(dateObj, url, name, description_prefix);
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
