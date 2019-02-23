const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');

let scrapedData = [];

const format = dateObj => {
    const dayStr = dateObj.format('DD');

    // we use reduce instead of map to act as a map+filter in one pass
    const cleanedData = scrapedData.reduce(function(prev, curr){
        const dateStart = moment.unix(parseInt(curr['date_time_start_raw']));

        // filter other days
        if (dateStart.tz('Europe/Paris').format('DD') === dayStr) {
            delete curr.date_time_start_raw;

            // filtering weird base64 for now
            if (typeof curr.img !== 'undefined' && curr.img.substring(0, 3) !== 'http') {
                delete curr.img;
            }

            const dateEnd = moment.unix(parseInt(curr['date_time_end_raw']));
            delete curr.date_time_end_raw;

            curr.date_time_start = dateStart.toISOString();
            curr.date_time_end = dateEnd.toISOString();
            curr.timezone = 'Europe/Paris';

            prev.push(curr);
        }

        return prev;
    },[]);

    return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
    const dayFormat = dateObj.format('YYYY-MM-DD');
    const url = `https://www.franceculture.fr/programmes/${dayFormat}/`;

    logger.log('info', `fetching ${url}`);

    return new Promise(function(resolve, reject) {
        return osmosis
            .get(url)
            .find('.program-item')
            .set({
                'date_time_start_raw': '@data-start-time', /* utc */
                'date_time_end_raw': '@data-end-time'
            })
            .select('.level1')
            .set({
                'title': '.program-item-content-elements-title',
            })
            .do(
                osmosis.follow('a.program-item-content-elements-infos@href')
                    .set({
                        'description':  '.intro > p'
                    })
            )
            .data(function (listing) {
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
    getName: 'franceculture',
    getScrap
};

module.exports = scrapModule;
