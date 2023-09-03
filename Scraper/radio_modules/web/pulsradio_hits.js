const scrapAbstract = require('./_abstract_pulsradio');

const name = 'pulsradio_hits';
const flux = 'hits';

const getScrap = dateObj => {
  return scrapAbstract.getScrap(dateObj, flux)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
