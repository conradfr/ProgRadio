import scrapAbstract from './_abstract_nrjgroup.js';

const name = 'nostalgie';

const getScrap = (dateObj, _subRadio, config) => {
  const url = 'https://www.nostalgie.fr/grille-emissions';
  return scrapAbstract.getScrap(dateObj, name, url, config)
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
