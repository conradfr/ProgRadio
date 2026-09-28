import scrapAbstract from '../_abstract/_abstract_radioking.js';

// actually Europe 2
const name = 'virgin';

const getScrap = (dateObj, _subRadio, config) => {
  const url = ['https://www.europe2.fr/programmes', 'https://www.europe2.fr/programmes-2'];
  return scrapAbstract.getScrap(dateObj, name, url, config);
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
