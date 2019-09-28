const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');

let scrapedData = {};

const format = (dateObj, name, img_prefix) => {
    dateObj.tz('Europe/Paris');
    const mains = [];
    scrapedData[name].forEach(function(curr) {
        let regexp = new RegExp(/de ([0-9]{1,2})[:]([0-9]{2})\sà\s([0-9]{1,2})[:]([0-9]{2})/);
        let match = curr.datetime_raw.match(regexp);

        // no time, exit
        if (match === null) { return; }

        const startDateTime = moment(curr.dateObj);
        const endDateTime = moment(curr.dateObj);

        startDateTime.hour(match[1]);
        startDateTime.minute(match[2]);
        startDateTime.second(0);
        endDateTime.hour(match[3]);
        endDateTime.minute(match[4]);
        endDateTime.second(0);

        // midnight etc
        if (startDateTime.hour() > endDateTime.hour() || (endDateTime.hour() === 0 && endDateTime.minute() === 0)) {
            endDateTime.add(1, 'days');
        }

        const newEntry = {
            'date_time_start': startDateTime.toISOString(),
            'date_time_end': endDateTime.toISOString(),
            'timezone': 'Europe/Paris',
            'img': curr.img.substr(0, 4) !== 'http' ? `${img_prefix}${curr.img}` : curr.img,
            'title': curr.title,
            'description': curr.description
        };

        mains.push(newEntry);
    });

    console.log(mains);
    return Promise.resolve(mains);
};

const fetch = (url, name, dateObj) => {
    dateObj.locale('fr');
    let day = dateObj.format('dddd').toLowerCase();

    logger.log('info', `fetching ${url}`);

    return new Promise(function(resolve, reject) {
        return osmosis
            .get(url)
            .find(`.actus-format1.${day}`)
            .set({
                'img': 'img@src',
                'datetime_raw': '.jours_diffusion',
                'title': 'h3',
                'description': 'p'
                }
            )
            .data(function (listing) {
                scrapedData[name].push(listing);
            })
            .done(function () {
                resolve(true);
            })
    });
};

const fetchAll = (url, name, dateObj) =>  {
    return fetch(url, name, dateObj);
};

const getScrap = (dateObj, url, name,  img_prefix) => {
    scrapedData[name] = [];
    return fetchAll(url, name, dateObj)
        .then(() => {
            return format(dateObj, name, img_prefix);
        });
};

const scrapModuleAbstract = {
    getScrap
};

module.exports = scrapModuleAbstract;
