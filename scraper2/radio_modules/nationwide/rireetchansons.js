import scrapAbstract from './_abstract_nrjgroup.js';

const name = 'rireetchansons';

const getScrap = (dateObj, _subRadio, config) => {
  const url = 'https://www.rireetchansons.fr/grille-emissions';
  return scrapAbstract.getScrap(dateObj, name, url, config)
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
