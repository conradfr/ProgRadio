let cleanedData = {};

// We reuse the scrapping from the "france_bleu" category

const getScrap = async (dateObj, subRadio) => {
  const subRadioString = subRadio.replace('france_bleu', 'francebleu');
  const module = require(`../francebleu/${subRadioString}.js`);
  cleanedData[subRadio] = await module.getScrap(dateObj);
  return cleanedData[subRadio];
};

const scrapModule = {
  getName: 'france_bleu',
  supportTomorrow: false,
  getScrap
};

module.exports = scrapModule;
