const datetime = require('node-datetime');
const redis = require("redis");

const rtl = require('./radio_modules/rtl.js');

const redisClient = redis.createClient();

let dateObj = datetime.create();

rtl.getScrap(dateObj)
    .then(function(data) {
        /* random int between 0 & 1000 to avoid key collision */
        const seed = Math.floor(Math.random() * (1000 - 1)) + 1;
        const redisKey = `schedule:one:rtl:${dateObj.format('d-m-y')}:${seed}`;

        const dataExport = {
                'radio': rtl.getName,
                'date': dateObj.format('d-m-y'),
                'items': data
        };

        redisClient.setex(redisKey, 172800, JSON.stringify(dataExport));
        redisClient.RPUSH('schedule:queue', redisKey);

    exit();
});
