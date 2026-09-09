import scrapAbstract from '../_abstract/_abstract_lesindes2.js';

const name = 'blackbox';

const getScrap = (dateObj, subRadio) => {
  const url = 'https://www.blackboxfm.fr/emissions/1';
  const description_prefix = 'https://www.blackboxfm.fr';
  return scrapAbstract.getScrap(dateObj, url, subRadio, description_prefix);
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
