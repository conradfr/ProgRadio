import scrapAbstract from '../_abstract/_abstract_lesindes2.js';

// Radio was renamed Radio µontact on 11/2022
// Keeping old code_name for now

const name = 'contactfm';

const getScrap = (dateObj, subRadio) => {
  const url = 'https://www.radiocontact.fr/emissions';
  const description_prefix = 'https://www.radiocontact.fr';
  return scrapAbstract.getScrap(dateObj, url, subRadio, description_prefix);
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
