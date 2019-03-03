const scrapAbstract = require('./_abstract.js');

const name = 'francebleu_larochelle';

const getScrap = dateObj => {
    const url = 'https://www.francebleu.fr/emissions/grille-programmes/la-rochelle';
    return scrapAbstract.getScrap(dateObj, url, name)
};

const scrapModule = {
    getName: name,
    getScrap
};

module.exports = scrapModule;
