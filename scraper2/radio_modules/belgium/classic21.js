import scrapAbstract from '../_abstract/_abstract_rtbs.js';

const name = 'classic21';
const id = '5';

const getScrap = dateObj => {
  return scrapAbstract.getScrap(dateObj, name, id)
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};

