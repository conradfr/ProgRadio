import scrapAbstract from '../_abstract/_abstract_lesindes2.js';

const name = 'ouifm';

const getScrap = (dateObj, subRadio) => {
  const url = 'https://www.ouifm.fr/emissions/1';
  const description_prefix = 'https://www.ouifm.fr';
  return scrapAbstract.getScrap(dateObj, url, subRadio, description_prefix);
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
