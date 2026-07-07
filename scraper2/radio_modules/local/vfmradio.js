import scrapAbstract from '../_abstract/_abstract_lesindes2.js';

const name = 'vfmradio';

const getScrap = (dateObj, subRadio) => {
  const url = 'https://www.vfmradio.fr/emissions';
  const description_prefix = 'https://www.vfmradio.fr';
  return scrapAbstract.getScrap(dateObj, url, subRadio, description_prefix);
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
