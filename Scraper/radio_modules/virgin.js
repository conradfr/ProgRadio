const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../lib/logger.js');

let scrapedData = [];
let referenceIndex = 0;

const format = dateObj => {

    // we use reduce instead of map to act as a map+filter in one pass
    const cleanedData = scrapedData.reduce(function(prev, curr, index, array){

        // Time
        let regexp = new RegExp(/([0-9]{1,2})[h|H]([0-9]{2})\sà\s([0-9]{1,2})[h|H]([0-9]{2})/);
        let match = curr.datetime_raw.match(regexp);

        // no time, exit
        if (match === null) { return prev; }

        const startDateTime = moment(curr.dateObj);
        const endDateTime = moment(curr.dateObj);

        startDateTime.hour(match[1]);
        startDateTime.minute(match[2]);
        startDateTime.second(0);
        endDateTime.hour(match[3]);
        endDateTime.minute(match[4]);
        endDateTime.second(0);

        let prevMatch = null;
        // keep only relevant time from previous day page
        if (startDateTime.isBefore(dateObj, 'day')) {
            if (index === 0) { return prev; }

            prevMatch = array[0].datetime_raw.match(regexp);
            array[0].dateObj.hour(prevMatch[1]);

            if (array[0].dateObj.isBefore(startDateTime)) { return prev; }

            // update day
            startDateTime.add(1, 'days');
            endDateTime.add(1, 'days');
        }
        // remove next day schedule from day page
        else {
            if (curr.dateObj !== array[index-1].dateObj) {
                referenceIndex = index;
            } else {
                prevMatch = array[referenceIndex].datetime_raw.match(regexp);
                let prevDate = moment(array[referenceIndex].dateObj);
                prevDate.hour(prevMatch[1]);

                if (prevDate.isAfter(startDateTime)) { return prev; }
            }

            if (startDateTime.hour() > endDateTime.hour()) {
                endDateTime.add(1, 'days');
            }
        }

        newEntry = {
            'schedule_start': startDateTime.toISOString(),
            'schedule_end': endDateTime.toISOString(),
            'timezone': 'Europe/Paris',
            'host': curr.host.join(", "),
            'title': curr.title
        };

        if (typeof curr.img !== 'undefined') {
            newEntry.img = 'https:' + curr.img;
        }

        prev.push(newEntry);
        return prev;
    },[]);

    return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
    const day = dateObj.day();
    let dayUrl = 'semaine';

    if (day === 0) { dayUrl = 'dimanche'; }
    else if (day === 6) { dayUrl = 'samedi'; }

    let url = `https://www.virginradio.fr/programmes-${dayUrl}/`;

    logger.log('info', `fetching ${url}`);

    return new Promise(function(resolve, reject) {
        return osmosis
            .get(url)
            .find('.programme_container')
            .set({
                'datetime_raw': '.diffused_at',
                'img': '.avatar > div.presentator span.img > img@src',
                'title': '.h2',
                'host': ['span.presentator'],
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
    getName: 'virgin',
    getScrap
};

module.exports = scrapModule;
