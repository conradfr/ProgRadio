const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');

let scrapedData = {};
let referenceIndex = 0;
let cleanedData = {};

const format = (dateObj, name) => {

    // we use reduce instead of map to act as a map+filter in one pass
    cleanedData[name] = scrapedData[name].reduce(function(prev, curr, index, array){
        let regexp = new RegExp(/^([0-9]{1,2})[:]([0-9]{2})/);
        let match = curr.datetime_raw.match(regexp);

        // no time = exit
        if (match === null) {
            return prev;
        }

        const startDateTime = moment(curr.dateObj);
        startDateTime.tz(dateObj.tz());

        startDateTime.hour(match[1]);
        startDateTime.minute(match[2]);
        startDateTime.second(0);

        let prevMatch = null;
        // keep only relevant time from previous day page
        if (startDateTime.isBefore(dateObj, 'day')) {
            if (index === 0) { return prev; }

            prevMatch = array[0].datetime_raw.match(regexp);
            array[0].dateObj.hour(prevMatch[1]);

            if (array[0].dateObj.isBefore(startDateTime)) { return prev; }

            // update day
            startDateTime.add(1, 'days');
        }
        // remove next day schedule from day page
        else {
            if (curr.dateObj !== array[index-1].dateObj) {
                referenceIndex = index;
            } else {
                prevMatch = array[referenceIndex].datetime_raw.match(regexp);
                let prevDate = moment(array[referenceIndex].dateObj);
                prevDate.hour(prevMatch[1]);

                if (prevDate.isAfter(startDateTime)) { return prev; }
            }
        }

        // Deal with radios on another timezone and convert to Paris time
        // @todo improves tz handling across the whole app

        if (startDateTime.tz() !== 'Europe/Paris') {
            startDateTime.tz('Europe/Paris');
        }

        let description = '';

        if (curr.sections.length > 0) {
            description += curr.sections.join(' / ');
            description += '. ';
        }

        if (curr.description !== undefined) {
            description += curr.description.replace(/\s\s+/g, ' ');
        }

        const newEntry = {
            'date_time_start': startDateTime.toISOString(),
            'timezone': 'Europe/Paris',
            'img': `https:${curr.img}`,
            'title': curr.title,
            'description': description
        };

        if (curr.host !== undefined) {
            newEntry.host = curr.host;
        }

        prev.push(newEntry);
        return prev;
    },[]);

    return Promise.resolve(cleanedData[name]);
};

const fetch = (url, name, dateObj) => {
    const day = dateObj.format('YYYY-MM-DD');
    const day_url = `${url}${day}`;

    logger.log('info', `fetching ${day_url}`);

    return new Promise(function(resolve, reject) {
        return osmosis
            .get(day_url)
            .find('.rts-modules-programme-list article')
            .set({
                'img': 'img.photo@data-src',
                'datetime_raw': 'span.time',
                'title': 'h2',
                'host': 'p.animators',
                'sections': ['.channel-bulletcolor li']
                }
            )
            .do(
                osmosis
                .follow('a:first@href')
                .set({
                    'description':  "meta[name='description']@content"
                })
            )
            .data(function (listing) {
                listing.dateObj = dateObj;
                scrapedData[name].push(listing);
            })
            .done(function () {
                resolve(true);
            })
    });
};

const fetchAll = (url, name, dateObj) =>  {
    /* radio schedule page has the format 6am -> 6am,
   so we get the previous day as well to get the full day and the filter the list later  */
    const previousDay = moment(dateObj);

    previousDay.locale('fr');
    previousDay.tz('Europe/Zurich');
    previousDay.subtract(1, 'days');

    dateObj.locale('fr');
    dateObj.tz('Europe/Zurich');

    return fetch(url, name, previousDay)
      .then(() => { return fetch(url, name, dateObj); });
};

const getScrap = (dateObj, url, name) => {
    scrapedData[name] = [];
    return fetchAll(url, name, dateObj)
        .then(() => {
            return format(dateObj, name);
        });
};

const scrapModuleAbstract = {
    getScrap
};

module.exports = scrapModuleAbstract;
