const scrapAbstract = require('./_abstract.js');

const name = 'contactfm';

const getScrap = dateObj => {
    const url = 'https://www.mycontact.fr/emissions';
    const img_prefix = 'https://www.mycontact.fr';
    return scrapAbstract.getScrap(dateObj, url, name, img_prefix)
};

const scrapModule = {
    getName: name,
    getScrap
};

module.exports = scrapModule;
