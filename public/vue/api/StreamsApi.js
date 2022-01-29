import axios from 'axios';

import {
  STREAMING_CATEGORY_ALL,
  STREAMING_CATEGORY_FAVORITES,
  STREAMING_CATEGORY_LAST
} from '../config/config';

// import cache from '../utils/cache';

/* eslint-disable arrow-body-style */
/* eslint-disable no-undef */

const getRadios = (countryOrUuid, sort, offset) => {
  const queryParamsList = [];
  if (countryOrUuid !== undefined && countryOrUuid !== null
    && countryOrUuid !== STREAMING_CATEGORY_ALL
    && countryOrUuid !== STREAMING_CATEGORY_LAST) {
    if (countryOrUuid.indexOf('-') !== -1) {
      queryParamsList.push(`radio=${countryOrUuid}`);
    } else {
      queryParamsList.push(`country=${countryOrUuid}`);
    }
  }

  if (sort !== null && sort !== undefined && countryOrUuid !== STREAMING_CATEGORY_LAST) {
    queryParamsList.push(`sort=${sort}`);
  } else if (countryOrUuid === STREAMING_CATEGORY_LAST) {
    queryParamsList.push(`sort=${STREAMING_CATEGORY_LAST.toLowerCase()}`);
  }

  if (offset !== null && offset !== undefined) {
    queryParamsList.push(`offset=${offset}`);
  }

  let baseUrl = '/streams/list';
  if (countryOrUuid !== STREAMING_CATEGORY_FAVORITES) {
    baseUrl = `https://${apiUrl}/stream`;
  }

  return axios.get(`${baseUrl}?${queryParamsList.join('&')}`)
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

  let baseUrl = '/streams/search';
  if (country !== STREAMING_CATEGORY_FAVORITES) {
    baseUrl = `https://${apiUrl}/stream`;
  }

  return axios.get(`${baseUrl}?${queryParamsList.join('&')}`)
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
      /* if (response.data.countries !== undefined) {
        cache.setCache(CACHE_KEY_STREAM_COUNTRIES, response.data.countries);
      } */

      return response.data.countries;
    });
};

const getBestFromRadio = (radioCodeName) => {
  return axios.get(`/streams/bestradio/${radioCodeName}`)
    .then((response) => {
      return response.data;
    });
};

const incrementPlayCount = (stationUuid, radioBrowserUrl) => {
  if (appEnv !== 'dev' && radioBrowserUrl !== null) {
    axios.get(`${radioBrowserUrl}/json/url/${stationUuid}`);
  }
};

const toggleFavoriteStream = (streamCodeName) => {
  return axios.get(`/streams/favorite/${streamCodeName}`)
    .catch((error) => {
      if (error.response.status === 403) {
        window.location.href = '/fr/login';
      }
    });
};

const getCountryFromLatLong = (latitude, longitude) => {
  return axios.get(`https://secure.geonames.org/countryCodeJSON?lat=${latitude}&lng=${longitude}&username=${geocode}`)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      if (error.response.status === 403) {
        window.location.href = '/fr/login';
      }
    });
};

export default {
  getConfig,
  getRadios,
  getRandom,
  getCountries,
  getBestFromRadio,
  searchRadios,
  incrementPlayCount,
  toggleFavoriteStream,
  getCountryFromLatLong
};
