import scrapAbstract from '../_abstract/_abstract_lesindes2.js';

const name = 'forum';

const getScrap = (dateObj, subRadio) => {
  const url = 'https://www.forum.fr/emissions/1';
  const description_prefix = 'https://www.forum.fr';
  return scrapAbstract.getScrap(dateObj, url, subRadio, description_prefix);
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
