const osmosis = require('osmosis');
const datetime = require('node-datetime');

let scrapedData = [];

const format = () => {
    let cleanedData = scrapedData.map(entry => {
        const jsDate = new Date();
        jsDate.setTime(entry['datetime_raw']);

        delete entry.datetime_raw;
        entry.schedule = jsDate;
        return entry;
    });

    return Promise.resolve(cleanedData);
};

const fetch = dateObj =>  {
    let dayFormat = dateObj.format('m-d-y');
    let url = `http://www.rtl.fr/grille/${dayFormat}`;

    return new Promise(function(resolve, reject) {
        return osmosis
            .get(url)
            .find('.timeline-schedule > .post-schedule-timeline > .post-schedule.main')
            .set({
                'datetime_raw': 'time@datetime'
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
                resolve(scrapedData);
            })
    });
};

const getScrap = dateObj => {
    return fetch(dateObj)
        .then(() => {
            return format();
        });
};

const rtl = {
    getName: 'rtl',
    getScrap
};

module.exports = rtl;
