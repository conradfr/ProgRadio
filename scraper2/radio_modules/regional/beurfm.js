import scrapAbstract from '../_abstract/_abstract_lesindes2.js';

const name = 'beurfm';

const getScrap = (dateObj, subRadio) => {
  const url = 'https://www.beurfm.net/emissions';
  const description_prefix = 'https://www.beurfm.net';
  return scrapAbstract.getScrap(dateObj, url, subRadio, description_prefix);
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
