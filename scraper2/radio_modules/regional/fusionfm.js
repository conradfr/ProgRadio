import scrapAbstract from '../_abstract/_abstract_radioking.js';

const name = 'fusionfm';

const getScrap = (dateObj, _subRadio, config) => {
  const url = 'https://www.fusionfm.fr/emissions';
  return scrapAbstract.getScrap(dateObj, name, url, config);
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
