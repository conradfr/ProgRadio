import scrapAbstract from '../_abstract/_abstract_lesindes2.js';

const name = 'chantefrance';

const getScrap = (dateObj, subRadio) => {
  const url = 'https://www.chantefrance.com/nos-emissions/1';
  const description_prefix = 'https://www.chantefrance.com/';
  return scrapAbstract.getScrap(dateObj, url, subRadio, description_prefix);
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
