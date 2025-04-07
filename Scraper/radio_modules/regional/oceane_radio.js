const scrapAbstract = require('./_abstract_lesindes2.js');

const name = 'oceane_radio';

const getScrap = (dateObj, subRadio) => {
  const url = 'https://oceane.ouest-france.fr/emissions/1';
  const description_prefix = 'https://oceane.ouest-france.fr';
  return scrapAbstract.getScrap(dateObj, url, subRadio, description_prefix);
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
