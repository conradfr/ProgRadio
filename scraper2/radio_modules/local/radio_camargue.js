import scrapAbstract from '../regional/_abstract_lesindes2.js';

const name = 'radio_camargue';

const getScrap = (dateObj, subRadio) => {
  const url = 'https://www.radio-camargue.com/emissions';
  const description_prefix = 'https://www.radio-camargue.com';
  return scrapAbstract.getScrap(dateObj, url, subRadio, description_prefix);
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
