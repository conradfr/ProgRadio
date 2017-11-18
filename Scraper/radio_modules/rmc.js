const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../lib/logger.js');

let scrapedData = [];

const dayFr = {
    'Lundi': 1,
    'Mardi': 2,
    'Mercredi': 3,
    'Jeudi': 4,
    'Vendredi': 5,
    'Samedi': 6,
    'Dimanche': 7
};

const format = dateObj => {
    dateObj.tz("Europe/Paris");
    dateObj.locale('fr');

    // we use reduce instead of map to act as a map+filter in one pass
    const cleanedData = scrapedData.reduce(function(prev, curr){

        if (curr.datetime_date.length === 0) { return prev; }

        let match = null;
        let startDateTime = null;
        let endDateTime = null;
        let regexp = null;

        for (var i = 0; i < curr.datetime_date.length; i++) {

            regexp = new RegExp(/(Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi|Dimanche)\sau\s(Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi|Dimanche)/);
            match = curr.datetime_date[i].match(regexp);

            let matched = false;
            let match_time = null;

            if (match !== null) {
                if (dateObj.isoWeekday() >= dayFr[match[1]] && dateObj.isoWeekday() <= dayFr[match[2]]) {
                   matched = true;
                }
            }
            else {
                match = curr.datetime_date[i].split(', ');
                const currentDayUpperCase = dateObj.format('dddd').charAt(0).toUpperCase() + dateObj.format('dddd').slice(1);

                if (match.length > 0 && match.indexOf(currentDayUpperCase) > -1) {
                    matched = true;
                }
                else {
                    // This show has no time infos so specify it there ...
                    if (dateObj.isoWeekday() === 'Lundi' && curr.title === 'RMC Poker Show') {
                        matched = true;
                        match = ['empty', '0', '0', '1', '0'];
                    }
                }
            }

            if (matched === true) {
                regexp = new RegExp(/([0-9]{1,2})[h|H]([0-9]{2})-([0-9]{1,2})[h|H]([0-9]{2})/);
                match_time = curr.datetime_time[i].match(regexp);
            }

            if (match_time !== null) {
                startDateTime = moment(curr.dateObj);
                startDateTime.hour(match_time[1]);
                startDateTime.minute(match_time[2]);
                startDateTime.second(0);

                endDateTime = moment(curr.dateObj);
                endDateTime.hour(match_time[3]);
                endDateTime.minute(match_time[4]);
                endDateTime.second(0);

                break;
            }
        }

        if (startDateTime === null) {
            return prev;
        }

        delete curr.datetime_date;
        delete curr.datetime_time;

        curr.schedule_start = startDateTime.toISOString();
        curr.schedule_end = endDateTime.toISOString();
        curr.timezone = 'Europe/Paris';
        curr.host =  curr.host.join(", ");

        prev.push(curr);
        return prev;
    },[]);

    return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
    let url = 'http://rmc.bfmtv.com/emission/';

    logger.log('info', `fetching ${url}`);

    return new Promise(function(resolve, reject) {
        return osmosis
            .get(url)
            .find('ul.list-unstyled.row')
            .select('li.bloc.col-md-1000-4 > ul.list-unstyled.et-wrapper')
            .set({
                'title': 'li[1] h2.title-medium.cap',
                'img': 'li[1] figure > img@src',
            })
            .set({
                'datetime_alt': 'span.horaire',
                'description': 'li[2] ul.list-depeche-2 > li[1]',
                'host': ['li[2] ul.list-depeche-2 > li[2] > ul > li' ],
                'datetime_date': ['li[2] ul.list-depeche-2 > li > span.title-depeche'],
                'datetime_time': ['li[2] ul.list-depeche-2 > li > div.hour'],
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
    getName: 'rmc',
    getScrap
};

module.exports = scrapModule;
