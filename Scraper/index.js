const moment = require('moment');
const redis = require("redis");

/* queue constants */
const QUEUE_SCHEDULE_ONE_PREFIX = 'schedule_input:one:';
const QUEUE_SCHEDULE_ONE_TTL = 172800;
const QUEUE_LIST = 'schedule_input:queue';

/* radios */
const rtl = require('./radio_modules/rtl.js');

const redisClient = redis.createClient();
let dateObj = moment();

console.log('Starting ...');

rtl.getScrap(dateObj)
    .then(function(data) {
        console.log(`Items found: ${data.length}`);

        const redisKey = `${QUEUE_SCHEDULE_ONE_PREFIX}rtl:${dateObj.format('DD-MM-YYYY')}`;

        const dataExport = {
                'radio': rtl.getName,
                'date': dateObj.format('DD-MM-YYYY'),
                'items': data
        };

        redisClient.setex(redisKey, QUEUE_SCHEDULE_ONE_TTL, JSON.stringify(dataExport));
        redisClient.RPUSH(QUEUE_LIST, redisKey);

        process.exit();
})
    .catch(error => {
            console.log(error);
            process.exit();
    });
