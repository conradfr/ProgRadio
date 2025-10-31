const scrapAbstract = require('./_abstract_lesindes2.js');

const name = 'forever';

const getScrap = (dateObj, subRadio) => {
  const url = 'https://www.foreverlaradio.fr/emissions';
  const description_prefix = 'https://www.foreverlaradio.fr';
  return scrapAbstract.getScrap(dateObj, url, subRadio, description_prefix);
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
