import scrapAbstract from '../_abstract/_abstract_lesindes2.js';

const name = 'activ_radio';

const getScrap = (dateObj, subRadio) => {
  const url = 'https://www.activradio.com/grille-des-programmes-et-emissions-activ-radio/1';
  const description_prefix = 'https://www.activradio.com';
  return scrapAbstract.getScrap(dateObj, url, subRadio, description_prefix);
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
