const osmosis = require('osmosis');
let moment = require('moment-timezone');

let scrapedData = [];

const format = dateObj => {
    const dayStr = dateObj.format('DD');

    // we use reduce instead of map to act as a map+filter in one pass
    const cleanedData = scrapedData.reduce(function(prev, curr){
        const date = moment(parseInt(curr['datetime_raw']));

        // Time
        let regexp = new RegExp(/([0-9]{1,2})[h|H]([0-9]{2})\s—\s([0-9]{1,2})[h|H]([0-9]{2})/);
        let match = curr.datetime_raw.match(regexp);

        // no time, exit
        if (match === null) { return prev; }

        const startDateTime = moment(curr.dateObj);
        const endDateTime = moment(curr.dateObj);

        startDateTime.hour(match[1]);
        startDateTime.minute(match[2]);
        startDateTime.second(0);
        endDateTime.hour(match[3]);
        endDateTime.minute(match[4]);
        endDateTime.second(0);

        // midnight etc
        if (startDateTime.hour() > endDateTime.hour()) {
            endDateTime.add(1, 'days');
        }

        delete curr.datetime_raw;
        curr.schedule_start = startDateTime.toISOString();
        curr.schedule_end = endDateTime.toISOString();
        curr.timezone = 'Europe/Paris';

        prev.push(curr);

        return prev;
    },[]);

    return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
    dateObj.locale('fr');
    let day = dateObj.format('dddd').toLowerCase();
    let url = `http://www.rfm.fr/programmes`;

    console.log(`fetching ${url} (${day})`);

    return new Promise(function(resolve, reject) {
        return osmosis
            .get(url)
            .find(`#${day}`)
            .set({
                'img': 'img@src'
            })
            .select('.texte > .texte_cnt')
            .set({
                'datetime_raw': '.horaire',
                'title': 'a'
            })
            .follow('a@href')
            .set({
                'description':  '.chapo'
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
    getName: 'rfm',
    getScrap
};

module.exports = scrapModule;