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

        if (startDateTime.hour() > endDateTime.hour()) {
            endDateTime.add(1, 'days');
        }

        delete entry.datetime_raw;
        entry.schedule_start = startDateTime.toISOString();
        entry.schedule_end = endDateTime.toISOString();
        entry.timezone = 'Europe/Paris';

        const host = entry.host.split('\n')[0];
        entry.host = host;

        prev.push(entry);
        console.log(entry);
        return prev;
    },[]);

    return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
    const url = 'http://www.europe1.fr/grille-des-programmes';
    // const url = 'http://progradio.local/europe1.html';

    dateObj.locale('fr');
    const tab = dateObj.format('dddd').toLowerCase();

    logger.log('info', `fetching ${url}`);

    return new Promise(function(resolve, reject) {
        return osmosis
            .get(url)
            .find(`#${tab}Tab > .programmes`)
            .set({
                'img': '.bloc .wrap-img img@src'
            })
            .set({
                'host': '.bloc .bloc_texte .titre',
                'title': '.bloc .bloc_texte .titre > span > a',
                'datetime_raw': '.bloc .bloc_texte span.heure'
            })
            // .select('.bloc_programmes > li[1]')
            .do(
                osmosis.follow('.bloc .bloc_texte .titre > span > a@href')
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
