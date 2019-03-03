const scrapAbstract = require('./_abstract.js');

const name = 'francebleu_provence';

const getScrap = dateObj => {
    const url = 'https://www.francebleu.fr/emissions/grille-programmes/provence';
    return scrapAbstract.getScrap(dateObj, url, name)
};

const scrapModule = {
    getName: name,
    getScrap
};

module.exports = scrapModule;
