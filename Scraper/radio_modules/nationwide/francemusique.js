const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');

let scrapedData = [];

const format = dateObj => {
    const dayStr = dateObj.format('DD');
    const datetimeStored = [];

    // we use reduce instead of map to act as a map+filter in one pass
    const cleanedData = scrapedData.reduce(function(prev, curr, index, array){
        const date = moment.unix(parseInt(curr['datetime_raw']));

        // as we have to analyze two pages and can get results from previous and next days ...
        // 1. filter other days
        if (date.tz('Europe/Paris').format('DD') !== dayStr) { return prev; }
        // 2. filter duplicated shows
        if (datetimeStored.indexOf(curr['datetime_raw']) > -1) { return prev; }

        datetimeStored.push(curr['datetime_raw']);

        delete curr.datetime_raw;

        curr.date_time_start = date.toISOString();
        curr.timezone = 'Europe/Paris';

        if (curr.host) {
            curr.host = curr.host.substr(3);
        }

        curr.sections = [];

        curr.sub.forEach(function(entry) {
            if (typeof entry.datetime_raw === 'undefined') { return true; }

            let secEntry = {
                date_time_start: moment.unix(parseInt(entry.datetime_raw)).toISOString(),
                title: entry.title,
                description: entry.description,
                img: entry.img
            };

            if (secEntry.presenter) {
                secEntry.presenter = secEntry.presenter.substr(3);
            }

            curr.sections.push(secEntry);
        });

        delete curr.sub;

        prev.push(curr);
        return prev;
    },[]);

    return Promise.resolve(cleanedData);
};

const fetch = dateStr=> {
    let url = `https://www.francemusique.fr/programmes/${dateStr}`;

    logger.log('info', `fetching ${url}`);

    return new Promise(function(resolve, reject) {
        return osmosis
            .get(url)
            .select('.program-grid > .step-list > .step-list-element-wrapper')
            .set({
                'datetime_raw': '@data-start-time', /* utc */
                'img': 'figure img@data-dejavu-src',
                'title': '.step-list-element .step-list-element-content-editorial-infos-title > h2',
                'description': '.step-list-element .step-list-element-content-editorial-infos-title > h3',
                'host': '.step-list-element .step-list-element-content-editorial-infos-producer',
                'datetime_alt': '.step-list-element .step-list-element-meta-start-date',
                'sub': [
                    osmosis.find('.step-list-element-children .step-list-element-wrapper')
                    .set({
                        'datetime_raw': '@data-start-time', /* utc */
                        'img': 'figure img@data-dejavu-src',
                        'title': '.step-list-element-content-editorial-infos-title h2',
                        'description': '.step-list-element-content-editorial-infos-title h3',
                        'presenter': '.step-list-element-content-editorial-infos-producer'
                    })
                ]
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
    const previousDay = moment(dateObj);
    previousDay.subtract(1, 'days');

    return fetch(previousDay.format('YYYY-MM-DD'))
        .then(() => { return fetch(dateObj.format('YYYY-MM-DD')); });
};

const getScrap = dateObj => {
    return fetchAll(dateObj)
        .then(() => {
            return format(dateObj);
        });
};

const scrapModule = {
    getName: 'francemusique',
    getScrap
};

module.exports = scrapModule;
