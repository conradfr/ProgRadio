const axios = require('axios');
let moment = require('moment-timezone');
const logger = require('../../lib/logger.js');

let scrapedData = [];

const format = dateObj => {
    const dayStr = dateObj.format('DD');

    // we use reduce instead of map to act as a map+filter in one pass
    const cleanedData = scrapedData.reduce(function(prev, curr){
        const date = moment(curr.diffusion_start_date);
        if (date.tz('Europe/Paris').format('DD') !== dayStr) {
            return prev;
        }

        const dateEnd = moment(curr.diffusion_end_date);

        let newEntry = {
            'title': curr.title,
            'description': curr.description,
            'timezone': 'Europe/Paris',
            'date_time_start': date.toISOString(),
            'date_time_end': dateEnd.toISOString(),
            'img': `https://images.6play.fr/v2/images/${curr.display_image.external_key}/raw`
        };

        prev.push(newEntry);
        return prev;
    },[]);

    return Promise.resolve(cleanedData);
};

const fetch = dateObj => {
    let dayFormat = 'YYYY-MM-DD';
    let url = 'https://pc.middleware.6play.fr/6play/v2/platforms/m6group_web/services/m6replay/guidetv';

    logger.log('info', `fetching ${url}`);

    return axios.get(url, {
        params: {
            channel: 'rtl2',
            from: `${dateObj.format(dayFormat)} 00:00:00`,
            to: `${dateObj.format(dayFormat)} 23:59:59`,
            limit: 99,
            offset: 0,
            with: 'realdiffusiondates'
        }
    })
        .then(function (response) {
            scrapedData = response.data.rtl2;
        })
        .catch(function (error) {
            logger.log('error', error);
        });
};

const fetchAll = dateObj =>  {
    return fetch(dateObj);
};

const getScrap = dateObj =>
{
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
