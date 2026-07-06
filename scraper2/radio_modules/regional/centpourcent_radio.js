import scrapAbstract from './_abstract_lesindes2.js';

const name = 'centpourcent_radio';

const getScrap = (dateObj, subRadio) => {
  const url = 'https://www.centpourcent.com/la-grille-des-programmes/1';
  const description_prefix = 'https://www.centpourcent.com';
  return scrapAbstract.getScrap(dateObj, url, subRadio, description_prefix);
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
