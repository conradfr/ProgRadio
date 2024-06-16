import type { DateTime } from 'luxon';

import type { Schedule } from '@/types/schedule';

import {
  CACHE_KEY_RADIOS,
  CACHE_KEY_COLLECTIONS,
  CACHE_KEY_CATEGORIES,
  LISTENING_SESSION_SOURCE
} from '@/config/config';

import cache from '@/utils/cache';

import type {
  GetRadiosDataResponse,
  listeningSessionPostData,
} from '@/types/schedule_api';

/* eslint-disable arrow-body-style */
const getSchedule = async (dateStr: string, params?: any): Promise<Schedule|null> => {
  /* eslint-disable no-undef */
  // @ts-expect-error apiUrl is defined on the global scope
  let url = `https://${apiUrl}/schedule/${dateStr}`;

  if (params !== undefined && params !== null) {
    url += '?';
  }

  if (params !== undefined && params !== null && params.now === true) {
    url += 'now=1&';
  }

  if (params !== undefined && params !== null) {
    if (params.collection !== undefined && params.collection !== null && params.collection !== '') {
      url += `c=${params.collection}`;
    } else if (params.radio !== undefined && params.radio !== null && params.radio !== '') {
      url += `r=${params.radio}`;
    } else if (params.radios !== undefined && params.radios !== null && params.radios.length > 0) {
      url += `r=${params.radios.join(',')}`;
    }
  }

  const response = await fetch(url);
  const data = await response.json();

  if (data && data.schedule) {
    // only cache full data
    if (params === undefined || params === null) {
      cache.setSessionCache(dateStr, data.schedule);
    }

    return data.schedule;
  }

  return null;
};

const getRadiosData = async (): Promise<GetRadiosDataResponse|null> => {
  /* eslint-disable no-undef */
  // @ts-expect-error apiUrl is defined on the global scope
  const response = await fetch(`https://${apiUrl}/radios`);

  const data = await response.json();

  if (data && data.radios !== undefined) {
    cache.setCache(CACHE_KEY_RADIOS, data.radios);
  }

  if (data && data.collections !== undefined) {
    cache.setCache(CACHE_KEY_COLLECTIONS, data.collections);
  }

  if (data && data.categories !== undefined) {
    cache.setCache(CACHE_KEY_CATEGORIES, data.categories);
  }

  return data;
};

const toggleFavoriteRadio = async (radioCodeName: string): Promise<any | null> => {
  const response = await fetch(`/radios/favorite/${radioCodeName}`);

  if (response.status === 403) {
    window.location.href = '/fr/login';
    return null;
  }

  return true;
};

const sendListeningSession = async (
  codeName: string,
  radioStreamCodeName: string|null,
  dateTimeStart: DateTime,
  dateTimeEnd: DateTime,
  id: string,
  ctrl: number,
  ending?: boolean
) => {
  const postData: listeningSessionPostData = {
    date_time_start: dateTimeStart.toISO(),
    date_time_end: dateTimeEnd.toISO(),
    source: LISTENING_SESSION_SOURCE,
    ctrl: Math.random()
  };

  if (ending === true) {
    postData.ending = true;
  }

  // radio or stream
  if (radioStreamCodeName !== undefined && radioStreamCodeName !== null) {
    postData.radio_stream_code_name = radioStreamCodeName;
  } else {
    postData.stream_id = codeName;
  }

  if (id !== undefined && id !== null) {
    /* eslint-disable no-underscore-dangle */
    /* eslint-disable max-len */
    // @ts-expect-error apiUrl is defined on the global scope
    const response = await fetch(`https://${apiUrl}/listening_session/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData)
    });

    const data = await response.json();

    if (data && data.id !== id) {
      /* eslint-disable object-shorthand */
      document.getElementById('app')!
        // @ts-ignore
        .__vue_app__.config.globalProperties.$pinia._s.get('player').setListeningSession({ data: data, ctrl });
    }

    return;
  }

  /* eslint-disable no-underscore-dangle */
  // @ts-expect-error apiUrl is defined on the global scope
  const response = await fetch(`https://${apiUrl}/listening_session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData)
  });

  const data = await response.json();

  if (data && data.id !== id) {
    // @ts-ignore
    document.getElementById('app')
      // @ts-ignore
      .__vue_app__.config.globalProperties.$pinia._s.get('player').setListeningSessionId({ id: data.id, ctrl });
  }
};

export default {
  getSchedule,
  getRadiosData,
  toggleFavoriteRadio,
  sendListeningSession
};
