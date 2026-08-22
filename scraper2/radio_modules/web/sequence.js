import scrapAbstract from '../_abstract/_abstract_proradio.js';

const name = 'sequence';

const getScrap = (dateObj, subRadio, config) => {
  const url = 'https://sequenceradio.com/grille-des-programmes/';
  return scrapAbstract.getScrap(dateObj, name, subRadio, url, config)
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
