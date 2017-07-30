const moment = require('moment');
const redis = require("redis");
const yaml = require('js-yaml');
const fs = require('fs');

// config
let config = {};
try {
   config = yaml.safeLoad(fs.readFileSync('../app/config/app_parameters.yml', 'utf8'));
} catch (e) {
    process.exit(1);
}

// queue constants
const QUEUE_SCHEDULE_ONE_PREFIX = 'schedule_input:one:';
const QUEUE_SCHEDULE_ONE_TTL = 172800;
const QUEUE_LIST = 'schedule_input:queue';

// radios
const rtl = require('./radio_modules/rtl.js');
const europe1 = require('./radio_modules/europe1.js');
const rtl2 = require('./radio_modules/rtl2.js');
const funradio = require('./radio_modules/funradio.js');

const radios = [
    rtl,
    rtl2,
    funradio,
    europe1
];

const redisClient = redis.createClient(config.parameters.redis_dsn);
const dateObj = moment();

console.log('Starting ...');

const results = radios.map(function (radio) {
    return radio.getScrap(dateObj)
        .then(function(data) {
            const dateFormat = 'DD-MM-YYYY';

            console.log(`${radio.getName} - items found: ${data.length}`);

            const redisKey = `${QUEUE_SCHEDULE_ONE_PREFIX}${radio.getName}:${dateObj.format(dateFormat)}`;

            const dataExport = {
                'radio': radio.getName,
                'date': dateObj.format(dateFormat),
                'items': data
            };

            redisClient.setex(redisKey, QUEUE_SCHEDULE_ONE_TTL, JSON.stringify(dataExport));
            redisClient.LREM(QUEUE_LIST, 1, redisKey);
            redisClient.RPUSH(QUEUE_LIST, redisKey);
        })
        .catch(error => {
            console.log(error);
        });
});

const schedule = Promise.all(results);

schedule.then(() => {
    console.log('All done, exiting ...');
    process.exit(1);
});
