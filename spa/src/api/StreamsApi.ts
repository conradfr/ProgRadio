import {
  STREAMING_CATEGORY_ALL,
  STREAMING_CATEGORY_FAVORITES,
  STREAMING_CATEGORY_HISTORY,
  STREAMING_CATEGORY_LAST,
  STREAMING_SORT_USER_LAST,
  PROGRADIO_AGENT,
  RADIOADDICT_AGENT
} from '@/config/config';

import apiUtils from '@/utils/apiUtils';

import type { Stream } from '@/types/stream';
import type { Countries } from '@/types/countries';
import type {
  GetConfigResponse,
  GetStreamsResponse,
  GetGeoResponse
} from '@/types/streams_api';

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
  // logged user is handled by the php side for now
  if (countryOrUuid !== STREAMING_CATEGORY_FAVORITES
    && countryOrUuid !== STREAMING_CATEGORY_HISTORY
    && sort !== STREAMING_SORT_USER_LAST) {
    // @ts-expect-error apiUrl is defined on the global scope
    baseUrl = `https://${apiUrl}/stream`;
  }

  const response = await fetch(`${baseUrl}?${queryParamsList.join('&')}`);
  return await response.json();
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
  // logged user is handled by the php side for now
  if (country !== STREAMING_CATEGORY_FAVORITES && country !== STREAMING_CATEGORY_HISTORY
    && sort !== STREAMING_SORT_USER_LAST) {
    // @ts-expect-error apiUrl is defined on the global scope
    baseUrl = `https://${apiUrl}/stream`;
  }

  const response = await fetch(`${baseUrl}?${queryParamsList.join('&')}`);
  return await response.json();
};

// TODO legacy, to be removed
const getRandom = async (country?: string|null): Promise<Stream|null> => {
  const queryParamsList: Array<string> = [];
  if (country !== undefined && country !== null && country !== STREAMING_CATEGORY_ALL) {
    queryParamsList.push(`country=${country}`);
  }

  const response = await fetch(`/streams/random?${queryParamsList.join('&')}`);
  return await response.json();
};

const getBestFromRadio = async (radioCodeName: string): Promise<Stream|null> => {
  const response = await fetch(`/streams/bestradio/${radioCodeName}`);
  return await response.json();
};

const addStreamPlayingError = async (radioCodeName: string, errorText?: string): Promise<string|null> => {
  const params = {};

  if (errorText) {
    // @ts-ignore
    params.error = errorText;
  }

  // @ts-expect-error apiUrl is defined on the global scope
  const response = await fetch(`https://${apiUrl}/stream_error/${radioCodeName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params)
  });

  const data = await response.json();

  return data.status;
};

const getConfig = async (): Promise<GetConfigResponse> => {
  // @ts-expect-error apiUrl is defined on the global scope
  const response = await fetch(`https://${apiUrl}/config`);
  return await response.json();
};

const getCountries = async (): Promise<Countries|null> => {
  // @ts-expect-error locale is defined on the global scope
  const response = await fetch(`https://${apiUrl}/countries?locale=${locale}`);
  const data = await response.json();

  if (data && data.countries) {
    return data.countries;
  }

  return null;
};

const incrementPlayCount = async (stationUuid: string, radioBrowserUrl: string|null): Promise<any> => {
  try {
    const response = await fetch(`${radioBrowserUrl}/json/url/${stationUuid}`, {
      headers: {
        // @ts-expect-error apiUrl is defined on the global scope
        'User-Agent': isProgRadio ? PROGRADIO_AGENT : RADIOADDICT_AGENT
      }
    });

    return await response.json();
  } catch (_e) {
    // nothing
  }

  return null;
};

const updateLastListened = async (stream: Stream): Promise<any> => {
  const response = await fetch(`/streams/listened/${stream.code_name}`);

  apiUtils.checkLogged(response);

  return await response.json();
};

const sendSearchTerm = async (term: string): Promise<any> => {
  // @ts-expect-error defined on the global scope
  const response = await fetch(`https://${apiUrl}/search_term`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ term })
  });

  apiUtils.checkLogged(response);

  return await response.json();
};

const toggleFavoriteStream = async (streamCodeName: string): Promise<any> => {
  const response = await fetch(`/streams/favorite/${streamCodeName}`);

  apiUtils.checkLogged(response);

  return await response.json();
};

const getCountryFromLatLong = async (latitude: number, longitude: number): Promise<GetGeoResponse|null> => {
  // @ts-expect-error geocode is defined on the global scope
  const response = await fetch(`https://secure.geonames.org/countryCodeJSON?lat=${latitude.toString()}&lng=${longitude.toString()}&username=${geocode}`);

  return await response.json();
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
