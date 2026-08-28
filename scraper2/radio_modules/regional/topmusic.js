import scrapAbstract from '../_abstract/_abstract_lesindes2.js';

const name = 'topmusic';

const getScrap = (dateObj, subRadio) => {
  const url = 'https://www.topmusic.fr/radio/1';
  const description_prefix = 'https://www.topmusic.fr';
  return scrapAbstract.getScrap(dateObj, url, subRadio, description_prefix);
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
