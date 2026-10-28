import scrapAbstract from '../_abstract/_abstract_espacegroup.js';

const name = 'rva';

const getScrap = (dateObj, subRadio, config) => {
  const url = 'https://www.radiorva.com/radio/emissions';
  return scrapAbstract.getScrap(dateObj, name, url, config, subRadio);
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
