import scrapAbstract from '../_abstract/_abstract_lesindes2.js';

const name = 'metropolys';

const getScrap = (dateObj, subRadio) => {
  const url = 'https://www.metropolys.com/emissions';
  const description_prefix = 'https://www.metropolys.com';
  return scrapAbstract.getScrap(dateObj, url, subRadio, description_prefix);
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
