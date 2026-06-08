let cleanedData = {};

// We reuse the scrapping from the "france_bleu" category

const getScrap = async (dateObj, subRadio) => {
  let subRadioString = subRadio.replace('france_bleu', 'francebleu');
  if (subRadioString.indexOf('maine') === -1) {
    subRadioString = subRadioString.replace('francebleu_main', 'francebleu_paris');
  }
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
