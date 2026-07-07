import scrapAbstract from '../_abstract/_abstract_espacegroup.js';

const name = 'alpes1_grenoble';

const getScrap = (dateObj, _subRadio, config) => {
  const url = 'https://grandgrenoble.alpes1.com/radio/emissions';
  return scrapAbstract.getScrap(dateObj, name, url, config);
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
