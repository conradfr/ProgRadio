const scrapAbstract = require('./_abstract_rtbs.js');

const name = 'classic21';

const getScrap = dateObj => {
    return scrapAbstract.getScrap(dateObj, name)
};

const scrapModule = {
    getName: name,
    getScrap
};

module.exports = scrapModule;
