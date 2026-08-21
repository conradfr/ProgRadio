import scrapAbstract from '../_abstract/_abstract_proradio.js';

const name = 'radio_goodlife';

const getScrap = (dateObj, _subRadio, config) => {
  const url = 'https://radiogoodlife.com/shows-schedule/';
  return scrapAbstract.getScrap(dateObj, name, url, config)
};

export default {
  getName: name,
  supportTomorrow: scrapAbstract.supportTomorrow,
  getScrap
};
