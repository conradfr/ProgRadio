import scrapAbstract from '../_abstract/_abstract_lesindes2.js';

const name = 'latina';

const getScrap = (dateObj, subRadio) => {
  const url = 'https://www.latina.fr/emissions/1';
  const description_prefix = 'https://www.latina.fr';
  return scrapAbstract.getScrap(dateObj, url, subRadio, description_prefix);
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
