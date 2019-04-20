const osmosis = require('osmosis');
const utils = require('../../lib/utils');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');

let scrapedData = [];
let referenceIndex = 0;

// gonna be messy
const format = dateObj => {

    // we use reduce instead of map to act as a map+filter in one pass
    const cleanedData = scrapedData.reduce(function(prev, curr, index, array){
        let newEntry = {
            'title': utils.upperCaseWords(curr.title),
            'timezone': 'Europe/Paris',
            'img': curr.img,
            'description': curr.description
        };

        // TIME

        const startDateTime = moment(curr.dateObj);

        // removing this for the moment, may revisit later to fine tune output if needed

        // let endDateTime = moment(curr.dateObj);

        // 1st try in title
        /*let regexp = new RegExp(/([0-9]{1,2}[H|h])\/([0-9]{1,2}[H|h])/);
        let match = curr.title.match(regexp);

        if (match !== null) {
            if (match[2] === 'MINUIT') {
                startDateTime.hour(0);
            } else {
                startDateTime.hour(match[2].substr(0, match[2].length - 1));
            }
            startDateTime.minute(0);
            startDateTime.second(0);

            if (match[4] === 'MINUIT') {
                endDateTime.hour(0);
            } else {
                endDateTime.hour(match[4].substr(0, match[4].length - 1));
            }

            endDateTime.minute(0);
            endDateTime.second(0);
        }
        // 2nd try in the description
        else {
            regexp = new RegExp(/de\s(([0-9]{1,2}h)|minuit)\sà\s(([0-9]{1,2}h)|minuit)/);
            match = curr.description.match(regexp);

            if (match !== null) {
                if (match[1] === 'minuit') {
                    startDateTime.hour(0);
                } else {
                    startDateTime.hour(match[1].substr(0, match[1].length - 1));
                }
                startDateTime.minute(0);
                startDateTime.second(0);

                if (match[3] === 'minuit') {
                    endDateTime.hour(0);
                } else {
                    endDateTime.hour(match[3].substr(0, match[3].length - 1));
                }

                endDateTime.minute(0);
                endDateTime.second(0);
            }
            else {*/
                let regexp = new RegExp(/([0-9]{1,2})[h|H]([0-9]{2})/);
                match = curr.datetime_raw.match(regexp);

                // no time, exit
                if (match === null) { return prev; }

                startDateTime.hour(match[1]);
                startDateTime.minute(match[2]);
                startDateTime.second(0);

            // }
        // }

        newEntry.date_time_start = startDateTime;

        let prevMatch = null;
        // keep only relevant time from previous day page
        if (startDateTime.isBefore(dateObj, 'day')) {
            if (index === 0) { return prev; }

            regexp = new RegExp(/([0-9]{1,2})[h|H]([0-9]{2})/);
            prevMatch = array[0].datetime_raw.match(regexp);
            array[0].dateObj.hour(prevMatch[1]);

            if (array[0].dateObj.isBefore(startDateTime)) { return prev; }

            // update day
            startDateTime.add(1, 'days');
        }
        // remove next day schedule from day page
        else {
            if (curr.dateObj !== array[index-1].dateObj) {
                referenceIndex = index;
            } else {
                regexp = new RegExp(/([0-9]{1,2})[h|H]([0-9]{2})/);
                prevMatch = array[referenceIndex].datetime_raw.match(regexp);

                if (prevMatch === null) { return prev; }

                let prevDate = moment(array[referenceIndex].dateObj);
                prevDate.hour(prevMatch[1]);

                if (prevDate.isAfter(startDateTime)) { return prev; }
            }
        }

        prev.push(newEntry);
        return prev;
    },[]);

    return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
    dateObj.locale('fr');
    let url = 'https://www.cheriefm.fr/grille-des-emissions';

    const dayOfWeek = dateObj.isoWeekday();
    let tab = 'week';
    if (dayOfWeek > 5) {
        tab = 'weekend';
    }

    logger.log('info', `fetching ${url}`);

    return new Promise(function(resolve, reject) {
        return osmosis
            .get(url)
            .find(`#${tab}`)
            .select('.programsGrid-listItem')
            .set({
                'datetime_raw': 'time.cardProgram-hour',
                'img': 'img.card-img@data-src',
                'title': '.cardProgram-title',
                'description': '.cardProgram-duration',
            })
            .data(function (listing) {
                listing.dateObj = dateObj;
                scrapedData.push(listing);
            })
            .done(function () {
                resolve(true);
            })
    });
};

const fetchAll = dateObj =>  {
    /* radio schedule page has the format 6am -> 5am,
       so we get the previous day as well to get the full day and the filter the list later  */
    const previousDay = moment(dateObj);
    previousDay.subtract(1, 'days');

    return fetch(previousDay)
        .then(() => { return fetch(dateObj); });
};

const getScrap = dateObj => {
    return fetchAll(dateObj)
        .then(() => {
            return format(dateObj);
        });
};

const scrapModule = {
    getName: 'cherie',
    getScrap
};

module.exports = scrapModule;
