const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../lib/logger.js');

let scrapedData = [];
let scrapedShows = {};

const format = (dateObj) => {
    dateObj.tz("Europe/Paris");
    dateObj.locale('fr');

    // we use reduce instead of map to act as a map+filter in one pass
    const cleanedData = scrapedData.reduce(function(prev, curr){

        let startDateTime = null;

        regexp = new RegExp(/([0-9]{1,2})[h|H]([0-9]{2})/);
        match_time = curr.time.match(regexp);

        if (match_time !== null) {
            startDateTime = moment(curr.dateObj);
            startDateTime.hour(match_time[1]);
            startDateTime.minute(match_time[2]);
            startDateTime.second(0);
        } else {
            return prev;
        }

        delete curr.time;

        curr.date_time_start = startDateTime.toISOString();
        curr.timezone = 'Europe/Paris';

        // host ?
        if (scrapedShows[curr.title] !== undefined) {
            curr.host = scrapedShows[curr.title].join(", ");
        }

        prev.push(curr);
        return prev;
    },[]);

    return Promise.resolve(cleanedData);
};

// to get hosts (they're not on the schedule page)
const fetchShows = () => {
    const url = 'https://rmc.bfmtv.com/emission/';

    logger.log('info', `fetching ${url} (shows)`);

    return new Promise(function(resolve, reject) {
        return osmosis
            .get(url)
            .find('ul.list-unstyled.row')
            .select('li.bloc.col-md-1000-4 > ul.list-unstyled.et-wrapper')
            .set({
                'title': 'li[1] h2.title-medium.cap',
                'host': ['li[2] ul.list-depeche-2 > li[2] > ul > li']
            })
            .data(function (listing) {
                if (listing.host.length > 0) {
                    scrapedShows[listing.title] = listing.host;
                }
            })
            .done(function () {
                resolve(true);
            })
    });
};

const fetch = dateObj => {
    const url = 'https://rmc.bfmtv.com/grille-radio/';
    dateObj.locale('fr');
    const day = dateObj.format('dddd').toLowerCase();
    const dayUcfirst = day.charAt(0).toUpperCase() + day.slice(1);

    logger.log('info', `fetching ${url}`);

    return new Promise(function(resolve, reject) {
        return osmosis
            .get(url)
            .find(`#${dayUcfirst}`)
            .select('.row')
            .set({
               'time': '.text-center > time',
            })
            // .select('div[2]')
            .set({
                'img': 'div[2] figure img.img-responsive-l@src',
                'title': 'div[2] figure img.img-responsive-l@alt',
            })
            .select('div[3]')
            .set({
                'description': 'p[1]'
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
    return fetchShows()
        .then(() => {
            return fetchAll(dateObj)
                .then(() => {
                    return format(dateObj);
                })
        });
};

const scrapModule = {
    getName: 'rmc',
    getScrap
};

module.exports = scrapModule;
