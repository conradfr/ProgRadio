const osmosis = require('osmosis');
let moment = require('moment-timezone');
let util = require('util');

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
            endDateTime.hour(match[3]);
            endDateTime.minute(match[4]);
        }
        else {
            regexp = new RegExp(/^([0-9]{1,2})[h|H]([0-9]{2})-([0-9]{1,2})[h|H]([0-9]{2}) DU LUNDI AU JEUDI - ([0-9]{1,2})[h|H]([0-9]{2})-([0-9]{1,2})[h|H]([0-9]{2}) LE VENDREDI/);
            match = entry.datetime_raw.match(regexp);

            if (match !== null) {

                const index = (dateObj.isoWeekday() === 5) ? 5 : 1;

                startDateTime.hour(match[index]);
                startDateTime.minute(match[index+1]);
                endDateTime.hour(match[index+2]);
                endDateTime.minute(match[index+3]);

                endDateTime.add(1, 'days');
            } else {
                return prev;
            }
        }

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
    const url = 'http://www.europe1.fr/grille-des-programmes';

    const dayOfWeek = dateObj.isoWeekday();
    let tab = 'week';
    if (dayOfWeek === 6) {
        tab = 'saturday';
    } else if (dayOfWeek === 7) {
        tab = 'sunday';
    }

    console.log(`fetching ${url}`);

    return new Promise(function(resolve, reject) {
        return osmosis
            .get(url)
            .find(`#${tab}Tab > .programmes > .bloc.clearfix`)
            // .select('.wrap-img')
            .set({
                'img': '.wrap-img img@src'
            })
            .select('.bloc_texte')
            .set({
                'host': '.titre',
                'description': 'p',
                'title': 'span.heure > span',
                'datetime_raw': 'span.heure'
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
    getName: 'europe1',
    getScrap
};

module.exports = scrapModule;
