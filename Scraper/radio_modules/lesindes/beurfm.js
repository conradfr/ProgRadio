const scrapAbstract = require('./_abstract.js');

const name = 'beurfm';

const getScrap = dateObj => {
    const url = 'https://www.beurfm.net/emissions';
    const img_prefix = 'https://www.beurfm.net';
    return scrapAbstract.getScrap(dateObj, url, name, img_prefix)
};

const scrapModule = {
    getName: name,
    getScrap
};

module.exports = scrapModule;
