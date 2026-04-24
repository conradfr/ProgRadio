import scrapAbstract from './_abstract_espacegroup.js';

const name = 'alpes1_sud';

const getScrap = dateObj => {
  const url = 'https://alpesdusud.alpes1.com/radio/grille-programme';
  return scrapAbstract.getScrap(dateObj, name, url);
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
