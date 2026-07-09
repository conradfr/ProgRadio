import scrapAbstract from '../_abstract/_abstract_lesindes2.js';

const name = 'canalfm';

const getScrap = (dateObj, subRadio) => {
  const url = 'https://www.canalfm.fr/emission/1';
  const description_prefix = 'https://www.canalfm.fr';
  return scrapAbstract.getScrap(dateObj, url, subRadio, description_prefix);
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
