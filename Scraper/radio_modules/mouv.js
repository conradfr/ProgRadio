const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../lib/logger.js');

let scrapedData = [];

const format = dateObj => {
    // we use reduce instead of map to act as a map+filter in one pass
    const cleanedData = scrapedData.reduce(function(prev, curr){
        if (typeof curr.title === 'undefined') { return prev; }

        // Time
        let regexp = new RegExp(/([0-9]{1,2})[h|H]([0-9]{2})/);
        let match = curr.datetime_raw.match(regexp);

        // no time, exit
        if (match === null) { return prev; }

        const startDateTime = moment(curr.dateObj);

        startDateTime.hour(match[1]);
        startDateTime.minute(match[2]);
        startDateTime.second(0);

        delete curr.datetime_raw;
        curr.schedule_start = startDateTime.toISOString();
        curr.timezone = 'Europe/Paris';

        prev.push(curr);

        return prev;
    },[]);

    return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
    dateObj.locale('fr');
    let dayFormat = dateObj.format('YYYY-MM-DD');
    let url = `http://www.mouv.fr/programmes/${dayFormat}`;

    logger.log('info', `fetching ${url}`);

    return new Promise(function(resolve, reject) {
        return osmosis
            .get(url)
            .select('.element')
            .set({
                'img': 'img.imagecache@src',
                'datetime_raw': '.index',
                'title': 'h2 a',
                'description': '.description'
            })
            .data(function (listing) {
                scrapedData.push(listing);
            })
            .done(function () {
                resolve(true);
            })
    });
};

const fetchAll = dateObj =>  {
    return fetch(dateObj);
};

const getScrap = dateObj => {
    return fetchAll(dateObj)
        .then(() => {
            return format(dateObj);
        });
};

const scrapModule = {
    getName: 'mouv',
    getScrap
};

module.exports = scrapModule;
