import scrapAbstract from './_abstract_nrjgroup.js';

const name = 'cherie';

const getScrap = dateObj => {
  const url = 'https://www.cheriefm.fr/grille-emissions';
  return scrapAbstract.getScrap(dateObj, name, url)
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
