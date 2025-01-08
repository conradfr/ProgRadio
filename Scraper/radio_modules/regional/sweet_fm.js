const scrapAbstract = require('./_abstract_lesindes2.js');

// Radio was renamed Radio contact on 11/2022
// Keeping old code_name for now

const name = 'sweet_fm';

const getScrap = (dateObj, subRadio) => {
  const url = 'https://www.sweetfm.fr/emissions';
  const description_prefix = 'https://www.sweetfm.fr';
  return scrapAbstract.getScrap(dateObj, url, subRadio, description_prefix);
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
