import scrapAbstract from '../_abstract/_abstract_lesindes2.js';

const name = 'voltage';

const getScrap = (dateObj, subRadio) => {
  const url = 'https://www.voltage.fr/emissions';
  const description_prefix = 'https://www.voltage.fr';
  return scrapAbstract.getScrap(dateObj, url, subRadio, description_prefix);
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
