import scrapAbstract from '../_abstract/_abstract_lesindes2.js';

const name = 'forever';

const getScrap = (dateObj, subRadio) => {
  const url = 'https://www.foreverlaradio.fr/emissions';
  const description_prefix = 'https://www.foreverlaradio.fr';
  return scrapAbstract.getScrap(dateObj, url, subRadio, description_prefix);
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
