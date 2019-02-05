const commandLineArgs = require('command-line-args');
const moment = require('moment-timezone');
const async = require('async');
const yaml = require('js-yaml');
const redis = require("redis");
const fs = require('fs');

const constants = require('./config/constants.js');
const radiosModule = require('./config/radios.js');

// config
let config = {};
try {
   config = yaml.safeLoad(fs.readFileSync('../config/scraper_parameters.yml', 'utf8'));
} catch (e) {
    process.exit(1);
}

// logger
const logger = require('./lib/logger.js');
logger.init(config.logmail);

const redisClient = redis.createClient(config.redis_dsn);

redisClient.on("error", function (err) {
    logger.log('error', err);
    process.exit(1);
});

// command line
const optionDefinitions = [
    { name: 'radios', alias: 'r', type: String, multiple: true },
    { name: 'collection', alias: 'c', type: String, multiple: true }
];
const options = commandLineArgs(optionDefinitions);

const dateObj = moment();
dateObj.tz("Europe/Paris");

logger.log('info', 'Starting ...');

const getResults = async (radios) => {
    const all = await radios.map(async function (radio) {
        const radio_module = require(`./radio_modules/${radio}.js`);

        return await radio_module.getScrap(dateObj)
            .then(function(data) {
                const dateFormat = 'DD-MM-YYYY';

                logger.log('info', `${radio_module.getName} - items found: ${data.length}`);

                if (data.length > 0) {
                    const redisKey = `${constants.QUEUE_SCHEDULE_ONE_PREFIX}${radio_module.getName}:${dateObj.format(dateFormat)}`;

                    const dataExport = {
                        'radio': radio_module.getName,
                        'date': dateObj.format(dateFormat),
                        'items': data
                    };

                    redisClient.setex(redisKey, constants.QUEUE_SCHEDULE_ONE_TTL, JSON.stringify(dataExport));
                    redisClient.LREM(constants.QUEUE_LIST, 1, redisKey);
                    redisClient.RPUSH(constants.QUEUE_LIST, redisKey);
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

  return Promise.all(all);
};

let funList = null;

if (options['radios']) {
    funList = [
        async function() {
            const result = await getResults(options['radios']);
            return 'radios via option'
        }
    ];
}
else {
  const collections = options['collection'] ? options['collection'] : radiosModule.getCollections();

  funList = collections.map(function (collection) {
      return async function() {
          return await getResults(radiosModule.getRadios(collection));
    }
  });
}

async.series(
    funList,
    function(err, results) {
        redisClient.quit();
        logger.log('info', 'All done, exiting ...');
        process.exit(1);
    }
);
