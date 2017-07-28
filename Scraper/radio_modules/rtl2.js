const osmosis = require('osmosis');
let moment = require('moment-timezone');

let scrapedData = [];

const format = dateObj => {
    const dayStr = dateObj.format('DD');

    // we use reduce instead of map to act as a map+filter in one pass
    const cleanedData = scrapedData.reduce(function(prev, curr){
        const date = moment(parseInt(curr['datetime_raw']));

        // filter other days
        if (date.tz('Europe/Paris').format('DD') === dayStr) {
            delete curr.datetime_raw;
            curr.schedule_start = date.toISOString();
            curr.timezone = 'Europe/Paris';

            prev.push(curr);
        }

        return prev;
    },[]);

    return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
    let dayFormat = dateObj.format('DD-MM-YYYY');
    let url = `http://www.rtl2.fr/grille/${dayFormat}`;

    console.log(`fetching ${url}`);

    return new Promise(function(resolve, reject) {
        return osmosis
            .get(url)
            .find('.timeline-schedule > .post-schedule-timeline > .post-schedule.main')
            .set({
                'datetime_raw': 'time@datetime' /* utc */
            })
            .select('.mdl-bvl')
            .set({
                'title': '.infos > h2.title',
                'img': 'img@data-src',
                'host': '.infos > p[1] > b',
                'description': '.infos > .text.desc'
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
    getName: 'rtl2',
    getScrap
};

module.exports = scrapModule;
