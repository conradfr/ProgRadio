const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../lib/logger.js');

let scrapedData = [];

const format = dateObj => {
    // we use reduce instead of map to act as a map+filter in one pass
    const cleanedData = scrapedData.reduce(function(prev, curr){
        if (typeof curr.datetime_raw === 'undefined') {
            return prev;
        }

        // TIME

        let regexp = new RegExp(/([0-9]{1,2})[h|H]([0-9]{0,2})-([0-9]{1,2})[h|H]([0-9]{0,2})/);
        let match = curr.datetime_raw.match(regexp);

        // should not happen
        if (match === null) {
            return prev;
        }

        const startDateTime = moment(curr.dateObj);
        startDateTime.hour(match[1]);
        if (match[2].length > 0) { startDateTime.minute(match[2]); }
        else { startDateTime.minute(0); }
        startDateTime.second(0);

        const endDateTime = moment(curr.dateObj);
        endDateTime.hour(match[3]);
        if (match[4].length > 0) { endDateTime.minute(match[4]); }
        else { endDateTime.minute(0); }
        endDateTime.second(0);

        delete curr.datetime_raw;

        if (endDateTime !== null) {
            curr.schedule_end = endDateTime.toISOString();
        }

        if (startDateTime.hour() > endDateTime.hour()) {
            endDateTime.add(1, 'days');
        }

        curr.schedule_start = startDateTime.toISOString();
        curr.schedule_end = endDateTime.toISOString();
        curr.timezone = 'Europe/Paris';

        // HOST

        if (curr.host.length > 0) {
            curr.host = curr.host.substr(13) // remove 'Présenté par '
        }

        prev.push(curr);
        return prev;
    },[]);

    return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
    const day = dateObj.day();
    let url = `http://www.novaplanet.com/radionova/programmes/${day}`;

    logger.log('info', `fetching ${url}`);

    return new Promise(function(resolve, reject) {
        return osmosis
            .get(url)
            .find('.views-row')
            .set({
                'datetime_raw': '.views-field-field-emission-diff-texte-value > span.field-content',
                'title': '.views-field-title > h3 > a',
                // 'img': 'a.imagecache > img@src',  give base64 ...
                'host': '.views-field-field-emission-generique-value > span.field-content'
            })
            .do(
                osmosis.follow('.views-field-view-node > span.field-content > a@href')
                    .find('.image-emission')
                    .set({
                        'img':  'img.imagecache-emission_image_page@src',
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
    return fetch(dateObj);
};

const getScrap = dateObj => {
    return fetchAll(dateObj)
        .then(() => {
            return format(dateObj);
        });
};

const scrapModule = {
    getName: 'radionova',
    getScrap
};

module.exports = scrapModule;
