import commandLineArgs from 'command-line-args'
import moment from 'moment-timezone';
import yaml from 'js-yaml';
import fs from 'fs';
import axios from 'axios';

import logger from './lib/logger.js';
import radiosModule from './lib/radios.js';

(async () => {
  try {

process.on('uncaughtException', function (err) {
  console.log('Caught exception: ', err);
});

// config
let config = {};
try {
  config = yaml.load(fs.readFileSync('./scraper_parameters.yml', 'utf8'));
} catch (e) {
  process.exit(1);
}

logger.init(config.logmail);

// command line
const optionDefinitions = [
  {name: 'radios', alias: 'r', type: String, multiple: true},
  {name: 'collection', alias: 'c', type: String, multiple: true},
  {name: 'tomorrow', alias: 't', type: Boolean},
  // Exclude radios who support tomorrow
  {name: 'no_tomorrow', alias: 'n', type: Boolean},
  // Only radios who support tomorrow
  {name: 'only_tomorrow', alias: 'o', type: Boolean}
];
const options = commandLineArgs(optionDefinitions);

logger.log('info', 'Starting ...');

const getResults = async (radios, radiosList) => {
  const all = await radios.map(async function (radio) {
    let radio_module = null;
    try {
      radio_module = await import(`./radio_modules/${radio.path}.js`);
    } catch (e) {
      console.log(e);
    }

    const dateObj = moment();
    if (options['tomorrow'] === true) {
      if (radio_module.default.supportTomorrow !== true) {
        return true;
      }

      dateObj.add(1, 'days');
    }

    if (options['no_tomorrow'] === true && radio_module.default.supportTomorrow === true) {
      return true;
    }

    if (options['only_tomorrow'] === true && radio_module.default.supportTomorrow === false) {
      return true;
    }

    dateObj.tz('Europe/Paris');

    const all2 = await radio.sub_radios.map(async function (sub_radio) {
      return await radio_module.default.getScrap(dateObj, sub_radio)
        .then(async function (data) {
          const dateFormat = 'DD-MM-YYYY';
          logger.log('info', `${radio_module.default.getName} (${sub_radio}) - items found: ${data.length}`);

          if (data.length > 0) {
            const dataExport = {
              'radio': radio_module.default.getName,
              'sub_radio': sub_radio,
              'date': dateObj.format(dateFormat),
              'items': data
            };

            await axios.post(process.env.API_SCHEDULE_URL || config.api_schedule_url, dataExport, {
              headers: {
                'X-Api-Key': process.env.API_KEY || config.api_key
              }
            })
              .then(function (response) {
                logger.log('info', `${radio_module.default.getName} (${sub_radio}) - api request done.`)
                // return true;
              }).catch((error) => {
                logger.log('warn', `${radio_module.default.getName} (${sub_radio}) - api request failed (${error}).`)
              });
          } else {
            // Log specifically when no data is found, in case of website change etc
            logger.log('warn', `${radio_module.default.getName} (${sub_radio}) - NO DATA`);
          }
        })
        .catch(error => {
          logger.log('error', error);
        });
    });

    return Promise.all(all2);
  });

  return Promise.all(all);
};

const radiosList = await radiosModule.radiosList(config, logger);

if (radiosList === null || radiosList.length === 0) {
  logger.log('warn', `Listing radios: no radios returned`);
}

if (options['radios']) {
  const radios = radiosModule.getRadiosPathFromCollection(options['radios'], radiosList);
  try {
    await getResults(radios);
  }
  catch(error) {
    logger.log('error', error);
    }
} else {
  const collections = options['collection'] ? options['collection'] : Object.keys(radiosList);
  collections.map(async (collection) => {
    logger.log('info', `Scraping collection: ${collection}`);
    try {
      return await getResults(radiosModule.getRadiosPathOfCollection(collection, radiosList));
    }
    catch(error) {
      logger.log('error', error);
    }
  });
}

} // try
catch(err) {
  console.log(err);
}
})();
