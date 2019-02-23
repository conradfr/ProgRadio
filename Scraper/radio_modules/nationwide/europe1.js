const osmosis = require('osmosis');
let moment = require('moment-timezone');
let util = require('util');
const logger = require('../../lib/logger.js');

let scrapedData = [];

const format = dateObj => {
    const cleanedData = scrapedData.reduce(function(prev, entry){
        if (util.isNullOrUndefined(entry.datetime_raw)) {
            return prev;
        }

        let startDateTime = moment(dateObj);
        const endDateTime = moment(dateObj);

        let regexp = new RegExp(/^([0-9]{1,2})[h|H]([0-9]{2})\n{0,1}\s{1,}- ([0-9]{1,2})[h|H]([0-9]{2})/);
        let match = entry.datetime_raw.match(regexp);

        if (match !== null) {
            startDateTime.hour(match[1]);
            startDateTime.minute(match[2]);
            startDateTime.second(0);
            endDateTime.hour(match[3]);
            endDateTime.minute(match[4]);
            endDateTime.second(0);
        } else {
            return prev;
        }

        if (startDateTime.hour() > endDateTime.hour()) {
            endDateTime.add(1, 'days');
        }

        delete entry.datetime_raw;
        entry.date_time_start = startDateTime.toISOString();
        entry.date_time_end = endDateTime.toISOString();
        entry.timezone = 'Europe/Paris';

        entry.description = entry.description ? entry.description.join(' ').trim() : null;

        entry.host = entry.host.split('\n')[0];
        entry.sections = [];

        if (typeof entry.sub === 'object' && typeof entry.sub.length === 'number') {
              entry.sub.forEach(function(element) {
                regexp = new RegExp(/([0-9]{1,2})[h|H]([0-9]{1,2})\s:\s(.*)/);
                let match = element.title.match(regexp);

                if (match !== null) {
                    startDateTime = moment(dateObj);
                    startDateTime.hour(match[1]);
                    startDateTime.minute(match[2]);
                    startDateTime.second(0);

                    let title = element.title2;

                    entry.sections.push({
                        'title': title,
                        'date_time_start': startDateTime.toISOString(),
                        'presenter': element.presenter,
                        'img': element.img
                    })
                }
            });
        }

        delete entry.sub;

        prev.push(entry);
        return prev;
    },[]);

    return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
    const url = 'https://www.europe1.fr/Grille-des-programmes';

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
            // can't seem to make description + sections work in the same call :/
            .do(
                osmosis.follow('.bloc .bloc_texte .titre > span > a@href')
                .find('.block_generique > .footer-article > div.author > div')
                .set({
                    'sub': {
                        'title': '.titre',
                        'title2': '.titre a',
                        'presenter': '.description',
                        'img': 'img.img-circle@data-src'
                    }
                })
            )
            .do(
                osmosis.follow('.bloc .bloc_texte .titre > span > a@href')
                    .find('section.content')
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
    getName: 'europe1',
    getScrap
};

module.exports = scrapModule;
