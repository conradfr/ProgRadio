import scrapAbstract from '../_abstract/_abstract_radioking.js';

const name = 'jobsetmusik';

const getScrap = (dateObj, _subRadio, config) => {
  const url = 'https://www.jobsetmusik.com/emissions';
  return scrapAbstract.getScrap(dateObj, name, url, config);
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
