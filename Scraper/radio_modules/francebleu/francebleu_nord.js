const scrapAbstract = require('./_abstract.js');

const name = 'francebleu_nord';

const getScrap = dateObj => {
    const url = 'https://www.francebleu.fr/emissions/grille-programmes/nord';
    return scrapAbstract.getScrap(dateObj, url)
};

const scrapModule = {
    getName: name,
    getScrap
};

module.exports = scrapModule;
