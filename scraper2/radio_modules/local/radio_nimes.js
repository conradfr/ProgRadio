import scrapAbstract from '../_abstract/_abstract_radioking.js';

const name = 'radio_nimes';

const getScrap = (dateObj, _subRadio, config) => {
  const url = 'https://www.radionimes.fr/emissions';
  return scrapAbstract.getScrap(dateObj, name, url, config);
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
