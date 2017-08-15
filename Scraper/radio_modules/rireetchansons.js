const osmosis = require('osmosis');
const moment = require('moment-timezone');
const striptags = require('striptags');

let scrapedData = [];
let referenceIndex = 0;

// gonna be messy
const format = dateObj => {
    // we use reduce instead of map to act as a map+filter in one pass
    const cleanedData = scrapedData.reduce(function(prev, curr, index, array){
        // Time
        let regexp = new RegExp(/([0-9]{1,2})[h|H]([0-9]{2})/);
        let match = curr.datetime_raw.match(regexp);

        // no time, exit
        if (match === null) { return prev; }

        let startDateTime = moment(curr.dateObj);
        startDateTime.hour(match[1]);
        startDateTime.minute(match[2]);
        startDateTime.second(0);

        // sometimes two programs starts at same time, filtering the second one for now ...
        if (index > 0 && typeof prev[index -1] !== 'undefined' && startDateTime.isSame(moment(prev[index -1].schedule_start), 'minute')) {
            return prev;
        }

        // keep only relevant time from previous day page
        if (startDateTime.isBefore(dateObj, 'day')) {
            // We want only the last
            if (index !== (array.length - 1)) { return prev; }

            // Check if current schedule starts at midnight (probably not)
            firstentryTime = moment(prev[0].schedule_start);
            if (firstentryTime.hour() === 0) { return prev; }

            startDateTime = firstentryTime;
            startDateTime.hour(0);
            startDateTime.minute(0);
            startDateTime.subtract(1, 'days');

            // update day
            startDateTime.add(1, 'days');
        }

        newEntry = {
            'schedule_start': startDateTime.toISOString(),
            'timezone': 'Europe/Paris',
            'title': striptags(curr.title),
            'description': striptags(curr.description),
            'img': curr.img
        };

        prev.push(newEntry);
        return prev;
    },[]);

    return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
    dateObj.locale('fr');
    let day = dateObj.format('dddd').toLowerCase();

    let url = 'http://www.rireetchansons.fr/grille-des-emissions';

    console.log(`fetching ${url} (${day})`);

    return new Promise(function(resolve, reject) {
        return osmosis
            .get(url)
            .find(`#${day}`)
            .select('.cardProgram')
            .set({
                'datetime_raw': 'time@datetime',
                'img': 'img.cardProgram-img@src',
                'title': 'h2.cardProgram-title',
                'description': '.cardProgram-desc',
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
    /* radio schedule page has the format 3am -> 3am,
       so we get the previous day as well to get the full day and the filter the list later  */
    const previousDay = moment(dateObj);
    previousDay.subtract(1, 'days');

    return fetch(dateObj)
        .then(() => { return fetch(previousDay); });
};

const getScrap = dateObj => {
    return fetchAll(dateObj)
        .then(() => {
            return format(dateObj);
        });
};

const scrapModule = {
    getName: 'rireetchansons',
    getScrap
};

module.exports = scrapModule;
