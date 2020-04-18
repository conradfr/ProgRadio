const scrapAbstract = require('./_abstract_rtbs.js');

const name = 'lapremiere';

const getScrap = dateObj => {
  return scrapAbstract.getScrap(dateObj, name)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
