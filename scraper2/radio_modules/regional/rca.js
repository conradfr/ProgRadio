import scrapAbstract from '../_abstract/_abstract_lesindes2.js';

const name = 'rca';

const getScrap = (dateObj, subRadio) => {
  const url = 'https://www.rcalaradio.com/emissions';
  const description_prefix = 'https://www.rcalaradio.com';
  return scrapAbstract.getScrap(dateObj, url, subRadio, description_prefix);
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
