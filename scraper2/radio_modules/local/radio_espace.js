import scrapAbstract from '../_abstract/_abstract_espacegroup.js';

const name = 'radio_espace';

const getScrap = (dateObj, subRadio, config) => {
  const url = 'https://www.radioespace.com/radio/grille-programme';
  return scrapAbstract.getScrap(dateObj, name, url, config, subRadio);
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
