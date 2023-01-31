import axios from 'axios';

import type { GetUserResponse } from '@/types/user_api';

const getUserData = async () => {
  try {
    const { data } = await axios.get<GetUserResponse>('/user');
    return data.user;
  } catch (error) {
    return null;
  }
};

/* eslint-disable arrow-body-style */
const saveSong = (song: string): Promise<any>|null => {
  return axios.get(`/user/song/add/${song}`)
    .catch((error) => {
      if (error.response.status === 403) {
        window.location.href = '/fr/login';
      }
      return null;
    });
};

/* eslint-disable arrow-body-style */
const removeSong = (id: number): Promise<any>|null => {
  return axios.get(`/user/song/remove/${id}`)
    .catch((error) => {
      if (error.response.status === 403) {
        window.location.href = '/fr/login';
      }
      return null;
    });
};

/* eslint-disable no-undef */
export default {
  getUserData,
  saveSong,
  removeSong
};
