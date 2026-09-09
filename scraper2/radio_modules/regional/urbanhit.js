import scrapAbstract from '../_abstract/_abstract_lesindes2.js';

const name = 'urbanhit';

const getScrap = (dateObj, subRadio) => {
  const url = 'https://www.urbanhit.fr/emissions';
  const description_prefix = 'https://www.urbanhit.fr';
  return scrapAbstract.getScrap(dateObj, url, subRadio, description_prefix);
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
