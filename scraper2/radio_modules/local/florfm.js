import scrapAbstract from '../_abstract/_abstract_lesindes2.js';

const name = 'florfm';

const getScrap = (dateObj, subRadio) => {
  const url = 'https://www.florfm.com/grille-des-programmes';
  const description_prefix = 'https://www.florfm.com';
  return scrapAbstract.getScrap(dateObj, url, subRadio, description_prefix);
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
