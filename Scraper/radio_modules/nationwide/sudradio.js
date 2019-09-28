const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');

let scrapedData = [];

const format = dateObj => {

    // we use reduce instead of map to act as a map+filter in one pass
    const cleanedData = scrapedData.reduce(function(prev, curr, index, array){

        // Time
        const regexp = new RegExp(/([0-9]{1,2})[h|H]([0-9]{2})/);
        let match = curr.datetime_raw_start.match(regexp);

        // no time, exit
        if (match === null) { return prev; }

        const startDateTime = moment(curr.dateObj);

        startDateTime.hour(match[1]);
        startDateTime.minute(match[2]);
        startDateTime.second(0);

        match = curr.datetime_raw_end.match(regexp);
        const endDateTime = moment(curr.dateObj);

        // no time, exit
        if (match !== null) {
            endDateTime.hour(match[1]);
            endDateTime.minute(match[2]);
            endDateTime.second(0);
        }

        newEntry = {
            'date_time_start': startDateTime.toISOString(),
            'date_time_end': endDateTime.toISOString(),
            'timezone': 'Europe/Paris',
            'host': curr.host,
            'title': curr.title,
            'img': curr.img
        };

        if (Array.isArray(curr.sub) && typeof curr.sub[0] !== 'string') {
            sections = [];

            curr.sub.forEach(function(entry) {
                let match = entry.datetime_raw.match(regexp);
                if (match !== null) {
                    const startDateTime = moment(curr.dateObj);
                    startDateTime.hour(match[1]);
                    startDateTime.minute(match[2]);
                    startDateTime.second(0);

                    let secEntry = {
                        date_time_start: startDateTime,
                        title: entry.title,
                        // description: entry.description,
                        img: entry.img,
                        presenter: entry.presenter

                    };

                    sections.push(secEntry);
                }
            });

            newEntry.sections = sections;
        }

        prev.push(newEntry);
        return prev;
    },[]);

    return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
    dateObj.locale('en');
    const dayFormat = dateObj.format('ddd').toLowerCase();
    const url = 'https://www.sudradio.fr/programmes/';

    logger.log('info', `fetching ${url}`);

    return new Promise(function(resolve, reject) {
        return osmosis
            .get(url)
            .find(`#nav-${dayFormat}`)
            .select('ol.list-unstyled li.sud-schedule__show')
            .set({
                'datetime_raw_start': 'time.sud-show__meta-date-start',
                'datetime_raw_end': 'time.sud-show__meta-date-end',
                'img': 'img@src',
                'title': 'h3 > a',
                'host': 'address',
                'sub': [
                    osmosis.select('section.sud-podcast header')
                        .set({
                            'datetime_raw': 'time.sud-podcast__meta-date-start',
                            'title': 'h4 a',
                            // 'description': '.step-list-element-content-editorial-infos-title h3',
                            'presenter': 'address'
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
    return fetch(dateObj);
};

const getScrap = dateObj => {
    return fetch(dateObj)
        .then(() => {
            return format(dateObj);
        });
};

const scrapModule = {
    getName: 'sudradio',
    getScrap
};

module.exports = scrapModule;
