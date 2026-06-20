import scrapAbstract from './_abstract_rfi.js';

const name = 'rfi_monde';

const getScrap = (dateObj, _subRadio, config) => {
  const url = 'https://www.rfi.fr/fr/grille-des-programmes-monde';
  return scrapAbstract.getScrap(dateObj, name, url, config)
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
