import axios from 'axios';

import {
  STREAMING_CATEGORY_ALL,
  STREAMING_CATEGORY_FAVORITES,
  STREAMING_CATEGORY_LAST
} from '@/config/config';

import type { Stream } from '@/types/stream';
import type { Countries } from '@/types/countries';
import type {
  GetConfigResponse,
  GetStreamsResponse,
  GetOneStreamResponse,
  GetCountriesResponse,
  GetGeoResponse
} from '@/types/streams_api';

/* eslint-disable arrow-body-style */
/* eslint-disable no-undef */

const getStreams = async (
  countryOrUuid?: string|null,
  sort?: string |null,
  offset?: number|null
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

  if (sort !== null && sort !== undefined && countryOrUuid !== STREAMING_CATEGORY_LAST) {
    queryParamsList.push(`sort=${sort}`);
  } else if (countryOrUuid === STREAMING_CATEGORY_LAST) {
    queryParamsList.push(`sort=${STREAMING_CATEGORY_LAST.toLowerCase()}`);
  }

  if (offset !== undefined && offset !== null && !Number.isNaN(offset)) {
    queryParamsList.push(`offset=${offset}`);
  }

  let baseUrl = '/streams/list';
  if (countryOrUuid !== STREAMING_CATEGORY_FAVORITES) {
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

const searchStreams = async (
  text?: string|null,
  country?: string|null,
  sort?: string|null,
  offset?: number|null
): Promise<GetStreamsResponse|null> => {
  const queryParamsList = [];
  if (text !== undefined && text !== null && text !== '') {
    queryParamsList.push(`text=${encodeURIComponent(text)}`);
  } else {
    return getStreams(country, sort, offset);
  }

  if (country !== null && country !== STREAMING_CATEGORY_ALL
    && country !== STREAMING_CATEGORY_LAST) {
    queryParamsList.push(`country=${country}`);
  }

  if (sort !== null && sort !== undefined && country !== STREAMING_CATEGORY_LAST) {
    queryParamsList.push(`sort=${sort}`);
  } else if (country === STREAMING_CATEGORY_LAST) {
    queryParamsList.push(`sort=${STREAMING_CATEGORY_LAST.toLowerCase()}`);
  }

  if (offset !== null) {
    queryParamsList.push(`offset=${offset}`);
  }

  let baseUrl = '/streams/search';
  if (country !== STREAMING_CATEGORY_FAVORITES) {
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

const toggleFavoriteStream = (streamCodeName: string) => {
  return axios.get(`/streams/favorite/${streamCodeName}`)
    .catch((error) => {
      if (error.response.status === 403) {
        window.location.href = '/fr/login';
      }
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
  incrementPlayCount,
  toggleFavoriteStream,
  getCountryFromLatLong
};
