import scrapAbstract from '../_abstract/_abstract_nrjgroup.js';

const name = 'nrj';

const getScrap = (dateObj, _subRadio, config) => {
  const url = 'https://www.nrj.fr/grille-emissions';
  return scrapAbstract.getScrap(dateObj, name, url, config)
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
