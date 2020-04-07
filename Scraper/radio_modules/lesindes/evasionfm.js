const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');

let scrapedData = [];

const format = dateObj => {
    // we use reduce instead of map to act as a map+filter in one pass
    const cleanedData = scrapedData.reduce(function(prev, curr){
        regexp = new RegExp(/^([0-9]{1,2})[h|H]([0-9]{0,2}){0,1} à ([0-9]{1,2})[h|H]([0-9]{0,2}){0,1}\s:\s(.*)/, 'm');
        const match = curr.title.match(regexp);

        // no time, exit
        if (match === null) {return prev;
        }

        const newEntry = {};
        const startDateTime = moment(curr.dateObj);
        const endDateTime = moment(curr.dateObj);

        startDateTime.hour(match[1]);
        startDateTime.minute(match[2] !== undefined ? match[2] : 0);
        startDateTime.second(0);

        endDateTime.hour(match[3]);
        endDateTime.minute(match[4] !== undefined ? match[4] : 0);
        endDateTime.second(0);

        newEntry.date_time_start = startDateTime.toISOString();
        newEntry.date_time_end = endDateTime.toISOString();
        newEntry.timezone = 'Europe/Paris';
        newEntry.title = match[5];
        newEntry.img = `https://www.evasionfm.com/${curr.img}`;

        prev.push(newEntry);
        return prev;
    },[]);

    return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
    dateObj.tz("Europe/Paris");
    dateObj.locale('fr');
    const day = dateObj.format('dddd').toLowerCase();
    let url = `https://www.evasionfm.com/programmes-${day}.html`;

    logger.log('info', `fetching ${url}`);

    return new Promise(function(resolve, reject) {
        return osmosis
            .get(url)
            .find(`div.row > div.col-md-12 > div.block_programme > div.row`)
            .set({
                'title': '.nomProgramme',
                'img': 'figure > img@src',
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
    getName: 'evasionfm',
    getScrap
};

module.exports = scrapModule;
