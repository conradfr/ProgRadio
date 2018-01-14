const moment = require('moment-timezone');
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

// logger
const logger = require('./lib/logger.js');
logger.init(config.parameters.logmail);

// command line
const commandLineArgs = require('command-line-args');
const optionDefinitions = [
    { name: 'radios', alias: 'r', type: String, multiple: true }
];
const options = commandLineArgs(optionDefinitions);

// queue constants
const QUEUE_SCHEDULE_ONE_PREFIX = 'schedule_input:one:';
const QUEUE_SCHEDULE_ONE_TTL = 172800;
const QUEUE_LIST = 'schedule_input:queue';

// radios
const radios = options['radios'] || [
    'rtl',
    'franceinter',
    'rmc',
    'nrj',
    'europe1',
    'franceinfo',
    'nostalgie',
    'funradio',
    'rfm',
    'skyrock',
    'rtl2',
    'virgin',
    'franceculture',
    'radioclassique',
    'rireetchansons',
    'radionova',
    'sudradio',
    'ouifm',
    'cherie'
];

const redisClient = redis.createClient(config.parameters.redis_dsn);
const dateObj = moment();
dateObj.tz("Europe/Paris");

logger.log('info', 'Starting ...');

const getResults = radios => {

    return radios.map(function (radio) {
        const radio_module = require(`./radio_modules/${radio}.js`);

        return radio_module.getScrap(dateObj)
            .then(function(data) {
                const dateFormat = 'DD-MM-YYYY';

                logger.log('info', `${radio_module.getName} - items found: ${data.length}`);

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
                else {
                    // Log specifically when no data is found, in case of website change etc
                    logger.log('warn', `${radio_module.getName} - NO DATA`);
                }
            })
            .catch(error => {
                logger.log('error', error);
            });
    });
};

redisClient.on("error", function (err) {
    logger.log('error', err);
    process.exit(1);
});

redisClient.on("ready", function () {
    const results = getResults(radios);
    const schedule = Promise.all(results);

    schedule.then(() => {
        redisClient.quit();
        logger.log('info', 'All done, exiting ...');
        process.exit(1);
    });
});
