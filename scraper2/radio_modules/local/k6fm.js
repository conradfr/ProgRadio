import scrapAbstract from '../_abstract/_abstract_lesindes2.js';

const name = 'k6fm';

const getScrap = (dateObj, subRadio) => {
  const url = 'https://www.k6fm.com/emissions';
  const description_prefix = 'https://www.k6fm.com';
  return scrapAbstract.getScrap(dateObj, url, subRadio, description_prefix);
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
