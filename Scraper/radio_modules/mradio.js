const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../lib/logger.js');

let scrapedData = [];

const dayFr = {
    'lundi': 1,
    'mardi': 2,
    'mercredi': 3,
    'jeudi': 4,
    'vendredi': 5,
    'samedi': 6,
    'dimanche': 7
};

const format = dateObj => {
    dateObj.tz("Europe/Paris");
    dateObj.locale('fr');

    const cleanedData = scrapedData.reduce(function(prev, entry){

        let matched = false;
        let match_time = null;
        let startDateTime = null;

        let regexp = new RegExp(/^Du\s(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\sau\s(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)/);
        let match = entry.datetime_raw.match(regexp);

        if (match !== null) {
            if (dateObj.isoWeekday() >= dayFr[match[1]] && dateObj.isoWeekday() <= dayFr[match[2]]) {
                matched = true;
            }
        }
        else {
            regexp = new RegExp(/^Le week-end/);
            match = entry.datetime_raw.match(regexp);

            if (match !== null && [6,7].indexOf(dateObj.isoWeekday()) > -1) {
                matched = true;
            }
            else {
                regexp = new RegExp(/^(Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi|Dimanche)/);
                match = entry.datetime_raw.match(regexp);

                if (match !== null && dateObj.isoWeekday() === dayFr[match[1].toLowerCase()]) {
                    matched = true;
                }
            }
        }

        if (matched === true) {
            regexp = new RegExp(/([0-9]{1,2})[h|H]([0-9]{2}) - ([0-9]{1,2})[h|H]([0-9]{2})/);
            match_time = entry.datetime_raw.match(regexp);
        } else {
            return prev;
        }

        startDateTime = moment(entry.dateObj);
        startDateTime.hour(match_time[1]);
        startDateTime.minute(match_time[2]);
        startDateTime.second(0);

        endDateTime = moment(entry.dateObj);
        endDateTime.hour(match_time[3]);
        endDateTime.minute(match_time[4]);
        endDateTime.second(0);

        // midnight etc
        if (startDateTime.hour() > endDateTime.hour()) {
            endDateTime.add(1, 'days');
        }

        entry.description = entry.description.join(' ');

        delete entry.datetime_raw;
        entry.schedule_start = startDateTime.toISOString();
        entry.schedule_end = endDateTime.toISOString();
        entry.timezone = 'Europe/Paris';

        prev.push(entry);
        return prev;
    },[]);

    return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
    const url = 'http://mradio.fr/radio/grille-programme';

    logger.log('info', `fetching ${url}`);

    return new Promise(function(resolve, reject) {
        return osmosis
            .get(url)
            .find(`.strict-block > .blog-style-square > .item`)
            // .select('.item')
            .set({
                'img': '.item-header > .item-photo > img@src'
            })
            .set({
                'title': '.item-content > h3 > a',
                'datetime_raw': '.item-content > .item-icons'
            })
            .do(
                osmosis.follow('.item-content > a@href')
                    .find('div.status-publish')
                    .set({
                        'description':  ['p']
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
    getName: 'mradio',
    getScrap
};

module.exports = scrapModule;
