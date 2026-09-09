import scrapAbstract from '../_abstract/_abstract_lesindes2.js';

const name = 'toulousefm';

const getScrap = (dateObj, subRadio) => {
  const url = 'https://www.toulousefm.fr/emissions';
  const description_prefix = 'https://www.toulouse.fm/';
  return scrapAbstract.getScrap(dateObj, url, subRadio, description_prefix);
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
