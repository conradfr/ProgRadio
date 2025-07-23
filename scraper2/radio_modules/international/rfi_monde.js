import scrapAbstract from './_abstract_rfi.js';

const name = 'rfi_monde';

const getScrap = dateObj => {
  const url = 'https://www.rfi.fr/fr/grille-des-programmes-monde';
  return scrapAbstract.getScrap(dateObj, name, url)
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
