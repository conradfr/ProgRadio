import scrapAbstract from '../_abstract/_abstract_radioking.js';

const name = 'banquisefm';

const getScrap = (dateObj, _subRadio, config) => {
  const url = 'https://www.banquisefm.com/emissions';
  return scrapAbstract.getScrap(dateObj, name, url, 'https://www.banquisefm.com', config);
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
