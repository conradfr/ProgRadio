import scrapAbstract from '../_abstract/_abstract_radioking.js';

const name = 'rfm';

const getScrap = (dateObj, _subRadio, config) => {
  const url = ['https://www.rfm.fr/programmes', 'https://www.rfm.fr/programmes-2'];
  return scrapAbstract.getScrap(dateObj, name, url, config);
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
