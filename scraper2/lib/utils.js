"use strict";

// @url https://medium.freecodecamp.org/three-ways-to-title-case-a-sentence-in-javascript-676a9175eb27
const upperCaseWords = (str) => {
    return str.toLowerCase().split(' ').map(function(word) {
        return word.trim() !== '' ? word.replace(word[0], word[0].toUpperCase()) : word;
    }).join(' ');
};

// @url https://stackoverflow.com/questions/2631001/test-for-existence-of-nested-javascript-object-key
const checkNested = (obj, level,  ...rest) => {
    if (obj === undefined || obj === null) return false
    if (rest.length === 0 && obj.hasOwnProperty(level)) return true
    return checkNested(obj[level], ...rest)
}

// @url https://www.delftstack.com/fr/howto/node.js/nodejs-sleep/
const sleep = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
// Smallest image of a srcset ("url 100w, url 370w, ...") at least minWidth wide,
// the largest one when none is, null when there's no usable candidate.
// Candidates with a density descriptor ("2x") or none are ignored.
const pickFromSrcset = (srcset, minWidth) => {
    if (typeof srcset !== 'string' || srcset.trim() === '') {
        return null;
    }

    const candidates = srcset.split(',')
        .map((candidate) => {
            const match = candidate.trim().match(/^(\S+)\s+(\d+)w$/);
            return match ? { url: match[1], width: parseInt(match[2], 10) } : null;
        })
        .filter((candidate) => candidate !== null)
        .sort((a, b) => a.width - b.width);

    if (candidates.length === 0) {
        return null;
    }

    const bigEnough = candidates.find((candidate) => candidate.width >= minWidth);
    return (bigEnough || candidates[candidates.length - 1]).url;
}

export default {
    upperCaseWords,
    checkNested,
    sleep,
    pickFromSrcset
};
