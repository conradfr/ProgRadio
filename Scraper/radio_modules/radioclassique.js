const osmosis = require('osmosis');
let moment = require('moment-timezone');
const logger = require('../lib/logger.js');

let scrapedData = [];

const format = dateObj => {

    // we use reduce instead of map to act as a map+filter in one pass
    const cleanedData = scrapedData.reduce(function(prev, curr){
        const date = moment.unix(parseInt(curr['datetime_raw']));
        date.second(0);

        delete curr.datetime_raw;
        curr.schedule_start = date.toISOString();
        curr.timezone = 'Europe/Paris';

        // host is string as "par <host>"
        const regexp = new RegExp(/par ([\'\w\s\A-zÀ-ÿ\|]+)/);
        const match = curr.host_raw.match(regexp);

        if (match !== null) {
            curr.host = match[1];
        }
        delete curr.host_raw;

        // getting correctly formed url for images
        if (typeof curr.img === 'string' && curr.img.length > 0 && curr.img.substr(0, 4) !== 'http') {
            curr.img = 'https://www.radioclassique.fr' + curr.img;
        }

        prev.push(curr);

        return prev;
    },[]);

    return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
    let dayFormat = dateObj.format('YYYY-MM-DD');
    let url = `https://www.radioclassique.fr/radio/grille-des-programmes/${dayFormat}/`;

    logger.log('info', `fetching ${url}`);

    return new Promise(function(resolve, reject) {
        return osmosis
            .get(url)
            .find('.timeline__block__row')
            .set({
                'datetime_raw': 'time@data-time' /* utc */
            })
            .select('.timeline__block__content > .timeline__block__content__item')
            .set({
                'title': 'p > a',
                'host_raw': 'p > em',
                'description':  '.timeline__guest > .media > p'
            })
            .do(
                osmosis.follow('a@href')
                    .find('.program__block')
                    .set({
                        'img':  '.block-image > img@src',
                        'description':  '.program__block__content > p[2]'
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
    getName: 'radioclassique',
    getScrap
};

module.exports = scrapModule;
