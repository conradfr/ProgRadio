import scrapAbstract from '../_abstract/_abstract_nrjgroup.js';

const name = 'cherie';

const getScrap = (dateObj, _subRadio, config) => {
  const url = 'https://www.cheriefm.fr/grille-emissions';
  return scrapAbstract.getScrap(dateObj, name, url, config)
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
