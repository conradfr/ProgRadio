const scrapAbstract = require('../regional/_abstract_lesindes2.js');

const name = 'tropiquesfm';

const getScrap = dateObj => {
  const url = 'https://www.tropiquesfm.com/emissions';
  const description_prefix = 'https://www.tropiquesfm.com';
  return scrapAbstract.getScrap(dateObj, url, name, description_prefix);
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
