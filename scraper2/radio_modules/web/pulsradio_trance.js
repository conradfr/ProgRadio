import scrapAbstract from './_abstract_pulsradio.js';

const name = 'pulsradio_trance';
const flux = 'Trance';

const getScrap = dateObj => {
  return scrapAbstract.getScrap(dateObj, flux, name)
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
