const osmosis = require('osmosis');
let moment = require('moment-timezone');

let scrapedData = [];

const format = dateObj => {
    // we use reduce instead of map to act as a map+filter in one pass
    const cleanedData = scrapedData.reduce(function(prev, curr){

        // Time

        let regexp = new RegExp(/([0-9]{1,2})[h|H]([0-9]{2})/);
        let match = curr.datetime_raw.match(regexp);

        // no time, exit
        if (match === null) {
            return prev;
        }

        const newEntry = {};

        const startDateTime = moment(dateObj);
        startDateTime.hour(match[1]);
        startDateTime.minute(match[2]);

        // filter other days (i.e last line is midnight next day)
        if (prev.length > 0 && startDateTime.isBefore(moment(prev[prev.length - 1].schedule_start))) {
            return prev;
        }

        newEntry.schedule_start = startDateTime.toISOString();
        newEntry.timezone = 'Europe/Paris';

        // Title & host

        regexp = new RegExp(/^([\w\s\A-zÀ-ÿ\|]+):([\w\s\A-zÀ-ÿ]+)/);
        match = curr.title_host.match(regexp);

        if (match === null) {
            regexp = new RegExp(/^([\w\s\A-zÀ-ÿ]+)\|([\w\s\A-zÀ-ÿ]+)/);
            match = curr.title_host.match(regexp);
        }

        // no host
        if (match === null) {
            newEntry.title = curr.title_host;
        }
        else {
            newEntry.title = match[1];
            newEntry.host = match[2];
        }

        prev.push(newEntry);

        return prev;
    },[]);

    return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
    let url = 'http://www.francetvinfo.fr/replay-radio/grille-des-emissions';

    console.log(`fetching ${url}`);

    return new Promise(function(resolve, reject) {
        return osmosis
            .get(url)
            .find('.program__grid__line')
            .set({
                'datetime_raw': '.program__grid__line__time',
                'title_host': '.program__grid__line__right > span'
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
    getName: 'franceinfo',
    getScrap
};

module.exports = scrapModule;
