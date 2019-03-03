const scrapAbstract = require('./_abstract.js');

const name = 'francebleu_creuse';

const getScrap = dateObj => {
    const url = 'https://www.francebleu.fr/emissions/grille-programmes/creuse';
    return scrapAbstract.getScrap(dateObj, url, name)
};

const scrapModule = {
    getName: name,
    getScrap
};

module.exports = scrapModule;
