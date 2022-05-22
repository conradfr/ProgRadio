const axios = require('axios');

const radiosList = async (config, logger) => {
  return await axios.get(process.env.API_RADIOS_URL || config.api_radios_url, {
    headers: {
      'X-Api-Key': process.env.API_KEY || config.api_key
    }})
    .then(function (response) {
      logger.log('debug', 'Listing radios: done');
      return response.data.radios || [];
    }).catch((error) => {
      logger.log('debug', `Listing radios: api request failed.`)
      return [];
    });
}

const getRadiosPathFromCollection = (radios, radiosCollection) => {
  return Object.keys(radiosCollection).reduce((acc, curr) => {
    const intersection = radiosCollection[curr].filter(x => radios.includes(x));
    const mapped = intersection.map(r =>`${curr}/${r}`);
    return [...acc, ...mapped];
  }, []);
}

const getRadiosPathOfCollection = (collection, radiosCollection) => {
  if (!radiosCollection.hasOwnProperty(collection)) {
    return [];
  }

  return radiosCollection[collection].reduce((acc, curr) => {
    const mapped = `${collection}/${curr}`;
    acc.push(mapped);
    return acc;
  }, []);
}

const radiosModule = {
    radiosList,
    getRadiosPathFromCollection,
    getRadiosPathOfCollection,
};

module.exports = radiosModule;
