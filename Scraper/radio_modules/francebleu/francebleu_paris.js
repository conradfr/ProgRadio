const scrapAbstract = require('./_abstract.js');

const name = 'francebleu_paris';

const getScrap = dateObj => {
    const url = 'https://www.francebleu.fr/emissions/grille-programmes/107-1';
    return scrapAbstract.getScrap(dateObj, url, name)
};

const scrapModule = {
    getName: name,
    getScrap
};

module.exports = scrapModule;
