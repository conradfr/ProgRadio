import scrapAbstract from '../_abstract/_abstract_lesindes2.js';

const name = 'radiostar';

const getScrap = (dateObj, subRadio) => {
  const url = 'https://www.radiostarsud.fr/emissions';
  const description_prefix = 'https://www.radiostarsud.fr';
  return scrapAbstract.getScrap(dateObj, url, subRadio, description_prefix);
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
