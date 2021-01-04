import axios from 'axios';

import { STREAMING_CATEGORY_ALL } from '../config/config';

/* eslint-disable arrow-body-style */
/* eslint-disable no-undef */

const getRadios = (country, sort, offset) => {
  const queryParamsList = [];
  if (country !== null && country !== STREAMING_CATEGORY_ALL) {
    queryParamsList.push(`country=${country}`);
  }

  if (sort !== null) {
    queryParamsList.push(`sort=${sort}`);
  }

  if (offset !== null) {
    queryParamsList.push(`offset=${offset}`);
  }

  return axios.get(`/streams/list?${queryParamsList.join('&')}`)
    .then((response) => {
      return response.data;
    });
};

const searchRadios = (text, country, sort, offset) => {
  const queryParamsList = [];
  if (text !== undefined && text !== null && text !== '') {
    queryParamsList.push(`text=${encodeURIComponent(text)}`);
  } else {
    return getRadios(country, sort, offset);
  }

  if (country !== null && country !== STREAMING_CATEGORY_ALL) {
    queryParamsList.push(`country=${country}`);
  }

  if (sort !== null) {
    queryParamsList.push(`sort=${sort}`);
  }

  if (offset !== null) {
    queryParamsList.push(`offset=${offset}`);
  }

  return axios.get(`/streams/search?${queryParamsList.join('&')}`)
    .then((response) => {
      return response.data;
    });
};

const getRandom = (country) => {
  const queryParamsList = [];
  if (country !== null && country !== STREAMING_CATEGORY_ALL) {
    queryParamsList.push(`country=${country}`);
  }

  return axios.get(`/streams/random?${queryParamsList.join('&')}`)
    .then((response) => {
      return response.data.stream;
    });
};

const getConfig = () => {
  return axios.get('/streams/config')
    .then((response) => {
      return response.data;
    });
};

const getCountries = () => {
  return axios.get(`/streams/countries?locale=${locale}`)
    .then((response) => {
      return response.data.countries;
    });
};

const incrementPlayCount = (stationUuid, radioBrowserUrl) => {
  if (appEnv !== 'dev' && radioBrowserUrl !== null) {
    axios.get(`${radioBrowserUrl}/json/url/${stationUuid}`);
  }
};

const getFavorites = () => {
  return axios.get('/streams/favorites')
    .then((response) => {
      return response.data.favorites;
    });
};

const toggleFavoriteStream = (streamCodeName) => {
  axios.get(`/streams/favorite/${streamCodeName}`)
    .catch((error) => {
      if (error.response.status === 403) {
        window.location.href = '/fr/login';
      }
    });
};

/* eslint-disable no-undef */
export default {
  getConfig,
  getRadios,
  getRandom,
  getCountries,
  getFavorites,
  searchRadios,
  incrementPlayCount,
  toggleFavoriteStream
};
