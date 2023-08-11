import axios from 'axios';
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
  GetScheduleResponse,
  listeningSessionPostData,
  PutListeningSessionResponse
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

  try {
    const { data } = await axios.get<GetScheduleResponse>(url);

    if (data.schedule !== undefined) {
      // only cache full data
      if (params === undefined || params === null) {
        cache.setCache(dateStr, data.schedule);
      }

      return data.schedule;
    }

    return null;
  } catch (error) {
    return null;
  }
};

const getRadiosData = async (): Promise<GetRadiosDataResponse|null> => {
  try {
    /* eslint-disable no-undef */
    // @ts-expect-error apiUrl is defined on the global scope
    const { data } = await axios.get<GetRadiosDataResponse>(`https://${apiUrl}/radios`);

    if (data.radios !== undefined) {
      cache.setCache(CACHE_KEY_RADIOS, data.radios);
    }

    if (data.collections !== undefined) {
      cache.setCache(CACHE_KEY_COLLECTIONS, data.collections);
    }

    if (data.categories !== undefined) {
      cache.setCache(CACHE_KEY_CATEGORIES, data.categories);
    }

    return data;
  } catch (error) {
    return null;
  }
};

const toggleFavoriteRadio = (radioCodeName: string): Promise<any>|null => {
  try {
    return axios.get(`/radios/favorite/${radioCodeName}`);
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response!.status === 403) {
      /* eslint-disable no-undef */
      window.location.href = '/fr/login';
    }
    return null;
  }
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
    const { data } = await axios.put<PutListeningSessionResponse>(`https://${apiUrl}/listening_session/${id}`, postData);

    if (data.id !== id) {
      /* eslint-disable object-shorthand */
      document.getElementById('app')!
        // @ts-ignore
        .__vue_app__.config.globalProperties.$pinia._s.get('player').setListeningSession({ data: data, ctrl });
    }

    return;
  }

  /* eslint-disable no-underscore-dangle */
  // @ts-expect-error apiUrl is defined on the global scope
  const { data } = await axios.post<PutListeningSessionResponse>(`https://${apiUrl}/listening_session`, postData);

  // @ts-ignore
  document.getElementById('app')
    // @ts-ignore
    .__vue_app__.config.globalProperties.$pinia._s.get('player').setListeningSessionId({ id: data.id, ctrl });
};

export default {
  getSchedule,
  getRadiosData,
  toggleFavoriteRadio,
  sendListeningSession
};
