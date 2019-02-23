const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');

let scrapedData = [];

const format = dateObj => {
    // we use reduce instead of map to act as a map+filter in one pass
    const cleanedData = scrapedData.reduce(function(prev, curr){
        if (typeof curr.datetime_raw === 'undefined') {
            return prev;
        }

        // TIME

        let regexp = new RegExp(/([0-9]{1,2}):([0-9]{0,2})/);
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

        // Export

        newEntry = {
            'date_time_start': startDateTime.toISOString(),
            'timezone': 'Europe/Paris',
            'img': 'https://www.nova.fr' + curr.img.split('?')[0],
            'host': curr.host.substr(4),
            'title': curr.title.substr(6),
            'description': curr.description.join("\n\n").replace(/\<br>/, "\n")

        };

        prev.push(newEntry);
        return prev;
    },[]);

    return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
    dateObj.locale('fr');
    const day = dateObj.format('dddd').toLowerCase();
    const url = `http://www.nova.fr/grille/${day}`;

    logger.log('info', `fetching ${url}`);

    return new Promise(function(resolve, reject) {
        return osmosis
            .get(url)
            .find('.flexbox-container.row-picture-grille')
            .set({
                'img': 'picture > img@src'
            })
            .select('.entry')
            .set({
                'datetime_raw': 'h2.post-title > time',
                'title': 'h2.post-title',
                'host': 'span.after-title',
                'description': ['p']
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
    getName: 'radionova',
    getScrap
};

module.exports = scrapModule;
