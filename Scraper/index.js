const moment = require('moment');
const redis = require("redis");

/* queue constants */
const QUEUE_SCHEDULE_ONE_PREFIX = 'schedule_input:one:';
const QUEUE_SCHEDULE_ONE_TTL = 172800;
const QUEUE_LIST = 'schedule_input:queue';

/* radios */
const rtl = require('./radio_modules/rtl.js');
const rtl2 = require('./radio_modules/rtl2.js');

const radios = [
    rtl,
    rtl2
];

const redisClient = redis.createClient();
let dateObj = moment();

console.log('Starting ...');

// TODO parallelize
radios.forEach(function(radio) {
    radio.getScrap(dateObj)
        .then(function(data) {
            console.log(`${radio.getName} - items found: ${data.length}`);

            const redisKey = `${QUEUE_SCHEDULE_ONE_PREFIX}${radio.getName}:${dateObj.format('DD-MM-YYYY')}`;

            const dataExport = {
                'radio': radio.getName,
                'date': dateObj.format('DD-MM-YYYY'),
                'items': data
            };

            redisClient.setex(redisKey, QUEUE_SCHEDULE_ONE_TTL, JSON.stringify(dataExport));
            redisClient.RPUSH(QUEUE_LIST, redisKey);


        })
        .catch(error => {
            console.log(error);
        });
});
