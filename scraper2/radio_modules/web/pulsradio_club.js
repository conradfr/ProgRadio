import scrapAbstract from './_abstract_pulsradio.js';

const name = 'pulsradio_club';
const flux = 'Club';

const getScrap = dateObj => {
  return scrapAbstract.getScrap(dateObj, flux, name)
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
