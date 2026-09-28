import scrapAbstract from '../_abstract/_abstract_radioking.js';

const name = 'vosgesfm';

const getScrap = (dateObj, _subRadio, config) => {
  const url = 'https://www.vosgesfm.fr/emissions';
  return scrapAbstract.getScrap(dateObj, name, url, 'https://www.vosgesfm.fr', config);
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
