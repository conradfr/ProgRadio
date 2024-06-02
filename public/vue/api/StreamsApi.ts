import axios from 'axios';

import {
  STREAMING_CATEGORY_ALL,
  STREAMING_CATEGORY_FAVORITES,
  STREAMING_CATEGORY_HISTORY,
  STREAMING_CATEGORY_LAST,
  STREAMING_SORT_USER_LAST
} from '@/config/config';

import type { Stream } from '@/types/stream';
import type { Countries } from '@/types/countries';
import type {
  GetConfigResponse,
  GetStreamsResponse,
  GetOneStreamResponse,
  GetCountriesResponse,
  GetStreamPlayingError,
  GetGeoResponse
} from '@/types/streams_api';

/* eslint-disable arrow-body-style */
/* eslint-disable no-undef */

const getStreams = async (
  countryOrUuid?: string|null,
  sort?: string |null,
  offset?: number|null,
  limit?: number|null
): Promise<GetStreamsResponse|null> => {
  const queryParamsList: Array<string> = [];
  if (countryOrUuid !== undefined && countryOrUuid !== null
    && countryOrUuid !== STREAMING_CATEGORY_ALL
    && countryOrUuid !== STREAMING_CATEGORY_LAST) {
    if (countryOrUuid.indexOf('-') !== -1) {
      queryParamsList.push(`radio=${countryOrUuid}`);
    } else {
      queryParamsList.push(`country=${countryOrUuid}`);
    }
  }

  if (sort && countryOrUuid !== STREAMING_CATEGORY_LAST
    && countryOrUuid !== STREAMING_CATEGORY_HISTORY) {
    queryParamsList.push(`sort=${sort}`);
  } else if (countryOrUuid === STREAMING_CATEGORY_LAST) {
    queryParamsList.push(`sort=${STREAMING_CATEGORY_LAST.toLowerCase()}`);
  }

  if (offset && !Number.isNaN(offset)) {
    queryParamsList.push(`offset=${offset}`);
  }

  if (limit && !Number.isNaN(limit)) {
    queryParamsList.push(`limit=${limit}`);
  }

  let baseUrl = '/streams/list';
  if (countryOrUuid !== STREAMING_CATEGORY_FAVORITES
    && countryOrUuid !== STREAMING_CATEGORY_HISTORY
    && sort !== STREAMING_SORT_USER_LAST) {
    // @ts-expect-error apiUrl is defined on the global scope
    baseUrl = `https://${apiUrl}/stream`;
  }

  try {
    const { data } = await axios.get<GetStreamsResponse>(`${baseUrl}?${queryParamsList.join('&')}`);
    return data;
  } catch (error) {
    return null;
  }
};

// TODO move parameters to objects
const searchStreams = async (
  text?: string|null,
  country?: string|null,
  sort?: string|null,
  offset?: number|null,
  limit?: number|null
): Promise<GetStreamsResponse|null> => {
  const queryParamsList = [];

  if (text !== undefined && text !== null && text !== '') {
    queryParamsList.push(`text=${encodeURIComponent(text)}`);
  } else {
    return getStreams(country, sort, offset, limit);
  }

  if (country && country !== STREAMING_CATEGORY_ALL
    && country !== STREAMING_CATEGORY_LAST) {
    queryParamsList.push(`country=${country}`);
  }

  if (sort && country !== STREAMING_CATEGORY_LAST) {
    queryParamsList.push(`sort=${sort}`);
  } else if (country === STREAMING_CATEGORY_LAST) {
    queryParamsList.push(`sort=${STREAMING_CATEGORY_LAST.toLowerCase()}`);
  }

  if (offset) {
    queryParamsList.push(`offset=${offset}`);
  }

  if (limit) {
    queryParamsList.push(`limit=${limit}`);
  }

  let baseUrl = '/streams/search';
  if (country !== STREAMING_CATEGORY_FAVORITES && country !== STREAMING_CATEGORY_HISTORY) {
    // @ts-expect-error apiUrl is defined on the global scope
    baseUrl = `https://${apiUrl}/stream`;
  }

  try {
    const { data } = await axios.get<GetStreamsResponse>(`${baseUrl}?${queryParamsList.join('&')}`);
    return data;
  } catch (error) {
    return null;
  }
};

// TODO legacy, to be removed
const getRandom = async (country?: string|null): Promise<Stream|null> => {
  const queryParamsList: Array<string> = [];
  if (country !== undefined && country !== null && country !== STREAMING_CATEGORY_ALL) {
    queryParamsList.push(`country=${country}`);
  }

  try {
    /* eslint-disable max-len */
    const { data } = await axios.get<GetOneStreamResponse>(`/streams/random?${queryParamsList.join('&')}`);
    return data.stream;
  } catch (error) {
    return null;
  }
};

const getBestFromRadio = async (radioCodeName: string): Promise<Stream|null> => {
  try {
    const { data } = await axios.get<GetOneStreamResponse>(`/streams/bestradio/${radioCodeName}`);
    return data.stream;
  } catch (error) {
    return null;
  }
};

const addStreamPlayingError = async (radioCodeName: string, errorText?: string): Promise<string|null> => {
  try {
    const params = {};

    if (errorText) {
      // @ts-ignore
      params.error = errorText;
    }

    const { data } = await axios.post<GetStreamPlayingError>(
      // @ts-expect-error apiUrl is defined on the global scope
      `https://${apiUrl}/stream_error/${radioCodeName}`,
      params
    );

    return data.status;
  } catch (error) {
    return null;
  }
};

const getConfig = async (): Promise<GetConfigResponse> => {
  // @ts-expect-error apiUrl is defined on the global scope
  const { data } = await axios.get<GetConfigResponse>(`https://${apiUrl}/config`);
  return data;
};

const getCountries = async (): Promise<Countries|null> => {
  try {
    // @ts-expect-error locale is defined on the global scope
    const { data } = await axios.get<GetCountriesResponse>(`https://${apiUrl}/countries?locale=${locale}`);
    return data.countries;
  } catch (error) {
    return null;
  }
};

const incrementPlayCount = (stationUuid: string, radioBrowserUrl: string|null): void => {
  // @ts-expect-error appEnv is defined on the global scope
  if (appEnv !== 'dev' && radioBrowserUrl !== null && radioBrowserUrl !== 'https://') {
    axios.get(`${radioBrowserUrl}/json/url/${stationUuid}`);
  }
};

const updateLastListened = (stream: Stream): void => {
  axios.get(`/streams/listened/${stream.code_name}`)
    .catch((error) => {
      if (error.response.status === 403) {
        window.location.href = '/fr/login';
      }
    });
};

const sendSearchTerm = (term: string): void => {
  // @ts-expect-error apiUrl is defined on the global scope
  axios.post(`https://${apiUrl}/search_term`, { term });
};

const toggleFavoriteStream = (streamCodeName: string): Promise<any>|null => {
  return axios.get(`/streams/favorite/${streamCodeName}`)
    .catch((error) => {
      if (error.response.status === 403) {
        window.location.href = '/fr/login';
      }
      return null;
    });
};

const getCountryFromLatLong = async (latitude: number, longitude: number): Promise<GetGeoResponse|null> => {
  try {
    /* eslint-disable max-len */
    // @ts-expect-error geocode is defined on the global scope
    const { data } = await axios.get<GetGeoResponse>(`https://secure.geonames.org/countryCodeJSON?lat=${latitude.toString()}&lng=${longitude.toString()}&username=${geocode}`);
    return data;
  } catch (error) {
    return null;
  }
};

export default {
  getConfig,
  getStreams,
  getRandom,
  getCountries,
  getBestFromRadio,
  searchStreams,
  addStreamPlayingError,
  incrementPlayCount,
  toggleFavoriteStream,
  getCountryFromLatLong,
  updateLastListened,
  sendSearchTerm
};
