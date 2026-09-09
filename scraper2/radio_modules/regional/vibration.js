import scrapAbstract from '../_abstract/_abstract_lesindes2.js';

const name = 'vibration';

const getScrap = (dateObj, subRadio) => {
  const url = 'https://www.vibration.fr/emissions/1';
  const description_prefix = 'https://www.vibration.fr';
  return scrapAbstract.getScrap(dateObj, url, subRadio, description_prefix);
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
