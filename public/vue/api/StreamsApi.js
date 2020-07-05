import axios from 'axios';

/* eslint-disable arrow-body-style */
/* eslint-disable no-undef */

const getRadios = (country, sort, offset) => {
  const queryParamsList = [];
  if (country !== null && country !== 'all') {
    queryParamsList.push(`country=${country}`);
  }

  if (sort !== null) {
    queryParamsList.push(`sort=${sort}`);
  }

  if (offset !== null) {
    queryParamsList.push(`offset=${offset}`);
  }

  return axios.get(`${baseUrl}streams/list?${queryParamsList.join('&')}`)
    .then((response) => {
      return response.data;
    });
};

const getRandom = (country) => {
  const queryParamsList = [];
  if (country !== null && country !== 'all') {
    queryParamsList.push(`country=${country}`);
  }

  return axios.get(`${baseUrl}streams/random?${queryParamsList.join('&')}`)
    .then((response) => {
      return response.data.stream;
    });
};

const getCountries = () => {
  return axios.get(`${baseUrl}streams/countries`)
    .then((response) => {
      return response.data.countries;
    });
};

const incrementPlayCount = (stationUuid) => {
  if (appEnv !== 'dev') {
    axios.get(`${radioBrowserUrl}/json/url/${stationUuid}`);
  }
};

/* eslint-disable no-undef */
export default {
  getRadios,
  getRandom,
  getCountries,
  incrementPlayCount
};
