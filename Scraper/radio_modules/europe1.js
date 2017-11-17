const osmosis = require('osmosis');
let moment = require('moment-timezone');
let util = require('util');
const logger = require('../lib/logger.js');

let scrapedData = [];

const format = dateObj => {
    const cleanedData = scrapedData.reduce(function(prev, entry){
        if (util.isNullOrUndefined(entry.datetime_raw)) {
            return prev;
        }

        const startDateTime = moment(dateObj);
        const endDateTime = moment(dateObj);

        let regexp = new RegExp(/^([0-9]{1,2})[h|H]([0-9]{2}) - ([0-9]{1,2})[h|H]([0-9]{2})/);
        let match = entry.datetime_raw.match(regexp);

        if (match !== null) {
            startDateTime.hour(match[1]);
            startDateTime.minute(match[2]);
            startDateTime.second(0);
            endDateTime.hour(match[3]);
            endDateTime.minute(match[4]);
            endDateTime.second(0);
        }

        /*
            Quikfix due to page changes

            TODO: better regexp handling days and interval instead of IFs
         */

        // DU LUNDI AU JEUDI 18H00 - 19H00
        if(match === null && dateObj.isoWeekday() < 5) {
            regexp = new RegExp(/^DU LUNDI AU JEUDI ([0-9]{1,2})[h|H]([0-9]{2}) - ([0-9]{1,2})[h|H]([0-9]{2})/);
            match = entry.datetime_raw.match(regexp);

            if (match !== null) {
                startDateTime.hour(match[1]);
                startDateTime.minute(match[2]);
                startDateTime.second(0);
                endDateTime.hour(match[3]);
                endDateTime.minute(match[4]);
                endDateTime.second(0);
            }
        }

        // LE VENDREDI DE 18H00 - 20H00
        if(match === null && dateObj.isoWeekday() === 5) {
            regexp = new RegExp(/^LE VENDREDI DE ([0-9]{1,2})[h|H]([0-9]{2}) - ([0-9]{1,2})[h|H]([0-9]{2})/);
            match = entry.datetime_raw.match(regexp);

            if (match !== null) {
                startDateTime.hour(match[1]);
                startDateTime.minute(match[2]);
                startDateTime.second(0);
                endDateTime.hour(match[3]);
                endDateTime.minute(match[4]);
                endDateTime.second(0);
            }
        }

        // VENDREDI, SAMEDI ET DIMANCHE 20H00 - 23H00
        if(match === null && dateObj.isoWeekday() > 4) {
            regexp = new RegExp(/^VENDREDI, SAMEDI ET DIMANCHE ([0-9]{1,2})[h|H]([0-9]{2}) - ([0-9]{1,2})[h|H]([0-9]{2})/);
            match = entry.datetime_raw.match(regexp);

            if (match !== null) {
                startDateTime.hour(match[1]);
                startDateTime.minute(match[2]);
                startDateTime.second(0);
                endDateTime.hour(match[3]);
                endDateTime.minute(match[4]);
                endDateTime.second(0);
            }
        }

        // 22H30-01H00 DU LUNDI AU JEUDI - 23H00-01H00 LE VENDREDI
        if(match === null) {
            regexp = new RegExp(/^([0-9]{1,2})[h|H]([0-9]{2})-([0-9]{1,2})[h|H]([0-9]{2}) DU LUNDI AU JEUDI - ([0-9]{1,2})[h|H]([0-9]{2})-([0-9]{1,2})[h|H]([0-9]{2}) LE VENDREDI/);
            match = entry.datetime_raw.match(regexp);

            if (match !== null) {
                const index = (dateObj.isoWeekday() === 5) ? 5 : 1;

                startDateTime.hour(match[index]);
                startDateTime.minute(match[index+1]);
                startDateTime.second(0);
                endDateTime.hour(match[index+2]);
                endDateTime.minute(match[index+3]);
                endDateTime.second(0);
            } else {
                return prev;
            }
        }

        if (startDateTime.hour() > endDateTime.hour()) {
            endDateTime.add(1, 'days');
        }

        delete entry.datetime_raw;
        entry.schedule_start = startDateTime.toISOString();
        entry.schedule_end = endDateTime.toISOString();
        entry.timezone = 'Europe/Paris';

        // not sure why I got an object that looks like an array here but well ...
        if (typeof entry.description === 'object') {
            entry.description = entry.description[0];
        }

        prev.push(entry);
        return prev;
    },[]);

    return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
    const url = 'http://www.europe1.fr/grille-des-programmes';

    const dayOfWeek = dateObj.isoWeekday();
    let tab = 'week';
    if (dayOfWeek === 6) {
        tab = 'saturday';
    } else if (dayOfWeek === 7) {
        tab = 'sunday';
    }

    logger.log('info', `fetching ${url}`);

    return new Promise(function(resolve, reject) {
        return osmosis
            .get(url)
            .find(`#${tab}Tab > .programmes`)
            // .select('.wrap-img')
            .set({
                'img': '.bloc.clearfix .wrap-img img@src'
            })
            .set({
                'host': '.bloc.clearfix .bloc_texte .titre',
                'title': '.bloc.clearfix .bloc_texte span.heure > span',
                'datetime_raw': '.bloc.clearfix .bloc_texte span.heure'
            })
            .select('.bloc_programmes > li[1]')
            .do(
                osmosis.follow('a@href')
                    .find('div[itemprop=articleBody]')
                    .set({
                        'description':  'p[1]'
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
    getName: 'europe1',
    getScrap
};

module.exports = scrapModule;
