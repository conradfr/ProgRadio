const scrapAbstract = require('./_abstract.js');

const name = 'francebleu_besancon';

const getScrap = dateObj => {
    const url = 'https://www.francebleu.fr/emissions/grille-programmes/besancon';
    return scrapAbstract.getScrap(dateObj, url, name)
};

const scrapModule = {
    getName: name,
    getScrap
};

module.exports = scrapModule;