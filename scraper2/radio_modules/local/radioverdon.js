import axios from 'axios';
import * as cheerio from 'cheerio';
import moment from 'moment-timezone';
import logger from '../../lib/logger.js';

const dayFr = {
    'lundi': 1,
    'mardi': 2,
    'mercredi': 3,
    'jeudi': 4,
    'vendredi': 5,
    'samedi': 6,
    'dimanche': 7
};

let scrapedData = [];

const format = async dateObj => {
    dateObj.tz('Europe/Paris');

    // TODO manage "nth day of week"

    const cleanedData = scrapedData.reduce(function (prev, entry) {
        if (!entry.datetime_raw ) {
            return prev;
        }

        let startDateTime = moment(dateObj);
        let endDateTime = null;
        let matched = false;

       // format 1

        let regexp = new RegExp(/^Le\s(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\set\s(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche) entre ([0-9]{1,2})\sh\s([0-9]{2})\set\s([0-9]{1,2})\sh\s([0-9]{2})/);
        let match = entry.datetime_raw.match(regexp);

        if (match !== null) {
            // not in day interval
            const dayNum = dateObj.isoWeekday();
            if (dayNum === dayFr[match[1]] || dayNum === dayFr[match[2]]) {
                matched = true;

                startDateTime.hour(match[3]);
                startDateTime.minute(match[4]);
                startDateTime.second(0);

                endDateTime = moment(dateObj);
                endDateTime.hour(match[5]);
                endDateTime.minute(match[6]);
                endDateTime.second(0);
            }
        }

        // format 2

        regexp = new RegExp(/^Du\s(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\sau\s(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche) entre ([0-9]{1,2})\sh\s([0-9]{2})\set\s([0-9]{1,2})\sh\s([0-9]{2})/);
        match = entry.datetime_raw.match(regexp);

        if (match !== null) {
            // not in day interval
            const dayNum = dateObj.isoWeekday();
            if (dayNum >= dayFr[match[1]] && dayNum <= dayFr[match[2]]) {
                matched = true;

                startDateTime.hour(match[3]);
                startDateTime.minute(match[4]);
                startDateTime.second(0);

                endDateTime = moment(dateObj);
                endDateTime.hour(match[5]);
                endDateTime.minute(match[6]);
                endDateTime.second(0);
            }
        }

        // format 3

        regexp = new RegExp(/^Du\s(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\sau\s(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche) à ([0-9]{1,2})\sh\s([0-9]{2})/);
        match = entry.datetime_raw.match(regexp);

        if (match !== null) {
            // not in day interval
            const dayNum = dateObj.isoWeekday();
            if (dayNum >= dayFr[match[1]] && dayNum <= dayFr[match[2]]) {
                matched = true;

                startDateTime.hour(match[3]);
                startDateTime.minute(match[4]);
                startDateTime.second(0);
            }
        }

        // format 4

        regexp = new RegExp(/[L|l]e\s(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\sà\s([0-9]{1,2})\sh\s([0-9]{2})/g);
        match = entry.datetime_raw.match(regexp);

        if (match !== null) {
            for (const date_match of match) {
                regexp = new RegExp(/^[L|l]e\s(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\sà\s([0-9]{1,2})\sh\s([0-9]{2})/);
                let specific_match = date_match.match(regexp);

                if (specific_match !== null) {
                    // not in day interval
                    const dayNum = dateObj.isoWeekday();
                    if (dayNum >= dayFr[specific_match[1]] && dayNum <= dayFr[specific_match[1]]) {
                        matched = true;

                        startDateTime.hour(specific_match[2]);
                        startDateTime.minute(specific_match[3]);
                        startDateTime.second(0);
                    }
                }
            }
        }

        // end of match

        if (matched === false) {
            return prev;
        }

        // ENTRY

        const newEntry = {
            'date_time_start': startDateTime.toISOString(),
            'title': entry.title,
        };

        if (endDateTime) {
            newEntry.date_time_end = endDateTime.toISOString();
        }

        if (entry.description) {
            newEntry.description = entry.description.trim();
        }

        if (entry.img) {
            newEntry.img = entry.img;
        }

        prev.push(newEntry);
        return prev;
    }, []);

    console.log('-------------');

    console.log(cleanedData);

    return Promise.resolve(cleanedData);
};

const fetch = async dateObj => {
    const urls = [
        'https://radio-verdon.com/emissions-radio-verdon/',
        'https://radio-verdon.com/les-emissions-externes/'
    ];

    for (const url of urls) {
        logger.log('info', `fetching ${url}`);

        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const data = $.extract({
            shows: [
                {
                    selector: '.vc_row.wpb_row',
                    value: {
                        datetime_raw: 'h6',
                        title: 'h3',
                        img: {
                            selector: 'img.vc_single_image-img',
                            value: 'src'
                        },
                        description: 'p',
                        // host: ['.anims span'],
                    }
                }
            ]
        });

        if (data && data.shows) {
            scrapedData = scrapedData.concat(data.shows);
        }
    }

    return Promise.resolve(true);
};

const fetchAll = dateObj => {
    return fetch(dateObj);
};

const getScrap = dateObj => {
    return fetchAll(dateObj)
        .then(() => {
            return format(dateObj);
        });
};
export default {
    getName: 'radioverdon',
    supportTomorrow: true,
    getScrap
};