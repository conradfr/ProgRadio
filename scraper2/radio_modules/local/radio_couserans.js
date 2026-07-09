import scrapAbstract from '../_abstract/_abstract_lesindes2.js';

const name = 'radio_couserans';

const getScrap = (dateObj, subRadio) => {
  const url = 'https://www.radiocouserans.fr/emissions/1';
  const description_prefix = 'https://www.radiocouserans.fr';
  return scrapAbstract.getScrap(dateObj, url, subRadio, description_prefix);
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
