"use strict";

// @url https://medium.freecodecamp.org/three-ways-to-title-case-a-sentence-in-javascript-676a9175eb27
const upperCaseWords = (str) => {
    return str.toLowerCase().split(' ').map(function(word) {
        return word.replace(word[0], word[0].toUpperCase());
    }).join(' ');
};


const utils= {
    upperCaseWords
};

module.exports = utils;
