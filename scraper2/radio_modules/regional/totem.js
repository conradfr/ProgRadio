import scrapAbstract from '../_abstract/_abstract_lesindes2.js';

const name = 'totem';

const getScrap = (dateObj, subRadio) => {
  const url = 'https://www.radiototem.net/emission-totem/1';
  const description_prefix = 'https://www.radiototem.net';
  return scrapAbstract.getScrap(dateObj, url, subRadio, description_prefix);
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
