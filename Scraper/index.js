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
const radios = [
    'rtl',
    'rtl2',
    'funradio',
    'europe1',
    'franceinter',
    'franceinfo',
    'nrj',
    'skyrock'
];

const redisClient = redis.createClient(config.parameters.redis_dsn);
const dateObj = moment();

console.log('Starting ...');

const results = radios.map(function (radio) {
    const radio_module = require(`./radio_modules/${radio}.js`);

    return radio_module.getScrap(dateObj)
        .then(function(data) {
            const dateFormat = 'DD-MM-YYYY';

            console.log(`${radio_module.getName} - items found: ${data.length}`);

            if (data.length > 0) {
                const redisKey = `${QUEUE_SCHEDULE_ONE_PREFIX}${radio_module.getName}:${dateObj.format(dateFormat)}`;

                const dataExport = {
                    'radio': radio_module.getName,
                    'date': dateObj.format(dateFormat),
                    'items': data
                };

                redisClient.setex(redisKey, QUEUE_SCHEDULE_ONE_TTL, JSON.stringify(dataExport));
                redisClient.LREM(QUEUE_LIST, 1, redisKey);
                redisClient.RPUSH(QUEUE_LIST, redisKey);
            }
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
