import scrapAbstract from '../_abstract/_abstract_lesindes2.js';

const name = 'dkl';

const getScrap = (dateObj, subRadio) => {
  const url = 'https://www.radiodkl.com/emissions/1';
  const description_prefix = 'https://www.radiodkl.com';
  return scrapAbstract.getScrap(dateObj, url, subRadio, description_prefix);
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
