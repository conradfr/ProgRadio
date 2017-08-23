const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../lib/logger.js');

let scrapedData = [];

const format = dateObj => {
    const dayStr = dateObj.format('DD');

    // we use reduce instead of map to act as a map+filter in one pass
    const cleanedData = scrapedData.reduce(function(prev, curr){
        const date = moment.unix(parseInt(curr['datetime_raw']));

        // filter other days
        if (date.tz('Europe/Paris').format('DD') === dayStr) {
            delete curr.datetime_raw;

            // filtering weird base64 for now
            if (typeof curr.img !== 'undefined' && curr.img.substring(0, 3) !== 'http') {
                delete curr.img;
            }

            curr.schedule_start = date.toISOString();
            curr.timezone = 'Europe/Paris';

            prev.push(curr);
        }

        return prev;
    },[]);

    return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
    let dayFormat = dateObj.format('YYYY-MM-DD');
    let url = `https://www.franceinter.fr/programmes/${dayFormat}/`;

    logger.log('info', `fetching ${url}`);

    return new Promise(function(resolve, reject) {
        return osmosis
            .get(url)
            .find('.rich-section-list-gdp-item')
            .set({
                'datetime_raw': '@data-start-time' /* utc */
            })
            .set({
                'img': '.simple-visual > img@src',
            })
            .select('.rich-section-list-gdp-item-content > .rich-section-list-gdp-item-content-show')
            .set({
                'title': 'a@title',
                'description': 'a.rich-section-list-gdp-item-content-title@title',
            })
            .select('.rich-section-list-gdp-item-content-infos-author')
            .set({
                'host': 'a@title',
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
    getName: 'franceinter',
    getScrap
};

module.exports = scrapModule;
