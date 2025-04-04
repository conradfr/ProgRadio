import axios from 'axios';
import utils from '../lib/utils.js';

const maxTries = 3;
const retryDelayMs = 1000;

const fetchRadios = async (config, logger) => {
  return await axios.get(process.env.API_RADIOS_URL || config.api_radios_url, {
    headers: {
      'X-Api-Key': process.env.API_KEY || config.api_key
    }})
    .then(function (response) {
      logger.log('debug', 'Listing radios: done');
      return response.data.radios || false;
    }).catch((error) => {
      logger.log('debug', `Listing radios: api request failed (${error}).`);
      return false;
    });
}

const radiosList = async (config, logger) => {
  for (let i=0;i<maxTries;i++) {
    const data = await fetchRadios(config, logger);
    if (data !== false) {
      return data || [];
    }
    await utils.sleep(retryDelayMs);
  }

  logger.log('debug', `Listing radios: api request failed (max retries).`);
  return [];
}

const getRadiosPathFromCollection = (radios, radiosCollection) => {
  return Object.keys(radiosCollection).reduce((acc, curr) => {
    const intersection = Object.keys(radiosCollection[curr]).filter(x => radios.includes(x));
    const mapped = intersection.map(r => {
      return {path: `${curr}/${r}`, sub_radios: radiosCollection[curr][r]};
    });
    return [...acc, ...mapped];
  }, []);
}

const getRadiosPathOfCollection = (collection, radiosCollection) => {
  if (!radiosCollection.hasOwnProperty(collection)) {
    return [];
  }

  return Object.keys(radiosCollection[collection]).reduce((acc, curr) => {
    const mapped = {path:`${collection}/${curr}`, sub_radios: radiosCollection[collection][curr]};
    acc.push(mapped);
    return acc;
  }, []);
}

export default {
    radiosList,
    getRadiosPathFromCollection,
    getRadiosPathOfCollection,
};
