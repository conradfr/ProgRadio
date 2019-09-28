const scrapAbstract = require('./_abstract.js');

const name = 'alouette';

const getScrap = dateObj => {
    const url = 'https://www.alouette.fr/emissions';
    const img_prefix = 'https://www.alouette.fr';
    return scrapAbstract.getScrap(dateObj, url, name, img_prefix)
};

const scrapModule = {
    getName: name,
    getScrap
};

module.exports = scrapModule;
