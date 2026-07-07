import scrapAbstract from '../_abstract/_abstract_pulsradio.js';

const name = 'pulsradio_hits';
const flux = 'Hits';

const getScrap = dateObj => {
  return scrapAbstract.getScrap(dateObj, flux, name)
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
