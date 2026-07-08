import scrapAbstract from '../_abstract/_abstract_radioking.js';

const name = 'radio_caroline';

const getScrap = (dateObj, _subRadio, config) => {
  const url = 'https://www.radiocaroline.bzh/emissions';
  return scrapAbstract.getScrap(dateObj, name, url, config);
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
