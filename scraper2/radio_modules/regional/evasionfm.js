import scrapAbstract from '../_abstract/_abstract_lesindes2.js';

const name = 'evasionfm';

const getScrap = (dateObj, subRadio) => {
  const url = 'https://www.evasionfm.com/nos-emissions/1';
  const description_prefix = 'https://www.evasionfm.com';
  return scrapAbstract.getScrap(dateObj, url, subRadio, description_prefix);
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
