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
            if (typeof curr.img !== 'undefined' && curr.img.substring(0, 4) !== 'http') {
                delete curr.img;
                if (typeof curr.img_alt !== 'undefined' && curr.img_alt.substring(0, 4) === 'http') {
                    curr.img = curr.img_alt;
                }
            }

            if (typeof curr.img_alt !== 'undefined') {
                delete curr.img_alt;
            }

            curr.schedule_start = date.toISOString();
            curr.timezone = 'Europe/Paris';

            prev.push(curr);
        }

        return prev;
    },[]);

    return Promise.resolve(cleanedData);
};

const fetch = dayFormat => {
    let url = `https://www.franceinter.fr/programmes/${dayFormat}`;

    logger.log('info', `fetching ${url}`);

    return new Promise(function(resolve, reject) {
        return osmosis
            .get(url)
            .find('.rich-section-list-gdp > article.rich-section-list-gdp-item')
            .set({
                'datetime_raw': '@data-start-time' /* utc */
            })
            .set({
                'img': '.simple-visual > img@src',
                'img_alt': '.simple-visual > img@data-dejavu-src',
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

    /* page of the day doesn't go online before 5am (maybe) so only get previous day page
        if scraper is run before that */

    const now = new moment();
    now.tz('Europe/Paris');

    if (now.hour() < 5) {
        return fetch('');
    }

    const previousDay = moment(dateObj);
    previousDay.subtract(1, 'days');

    return fetch(previousDay.format('YYYY-MM-DD'))
        .then(() => { return fetch(''); });
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
