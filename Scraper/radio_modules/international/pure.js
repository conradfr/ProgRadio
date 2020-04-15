const scrapAbstract = require('./_abstract_rtbs.js');

const name = 'pure';

const getScrap = dateObj => {
    return scrapAbstract.getScrap(dateObj, name)
};

const scrapModule = {
    getName: name,
    getScrap
};

module.exports = scrapModule;
