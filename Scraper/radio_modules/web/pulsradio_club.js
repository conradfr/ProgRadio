const scrapAbstract = require('./_abstract_pulsradio');

const name = 'pulsradio_club';
const flux = 'club';

const getScrap = dateObj => {
  return scrapAbstract.getScrap(dateObj, flux)
};

const scrapModule = {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

module.exports = scrapModule;
