import scrapAbstract from '../_abstract/_abstract_rtbs.js';

const name = 'vivacite';
const id = '10';

const getScrap = dateObj => {
  return scrapAbstract.getScrap(dateObj, name, id)
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

