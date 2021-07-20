const scrapAbstract = require('../regional/_abstract_lesindes.js');

const name = 'tropiquesfm';

const getScrap = dateObj => {
  dateObj.tz('GMT');
  const url = 'https://www.tropiquesfm.com/emissions';
  const img_prefix = 'https://www.tropiquesfm.com';
  return scrapAbstract.getScrap(dateObj, url, name, img_prefix)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
