"use strict";

// @url https://medium.freecodecamp.org/three-ways-to-title-case-a-sentence-in-javascript-676a9175eb27
const upperCaseWords = (str) => {
    return str.toLowerCase().split(' ').map(function(word) {
        return word.replace(word[0], word[0].toUpperCase());
    }).join(' ');
};

// @url https://stackoverflow.com/questions/2631001/test-for-existence-of-nested-javascript-object-key
const checkNested = (obj, level,  ...rest) => {
    if (obj === undefined || obj === null) return false
    if (rest.length == 0 && obj.hasOwnProperty(level)) return true
    return checkNested(obj[level], ...rest)
}

const utils= {
    upperCaseWords,
    checkNested
};

module.exports = utils;
