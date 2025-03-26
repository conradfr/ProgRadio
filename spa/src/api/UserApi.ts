import type { GetUserResponse } from '@/types/user_api';

import apiUtils from '@/utils/apiUtils';

const getUserData = async (): Promise<GetUserResponse | null> => {
  const response = await fetch('/user');
  const data = await response.json();

  if (data && data.user) {
    return data;
  }

  return null;
};

/* eslint-disable arrow-body-style */
const saveSong = async (song: string): Promise<any | null> => {
  const response = await fetch(`/user/song/add/${song}`);

  apiUtils.checkLogged(response);

  return response.json();
};

/* eslint-disable arrow-body-style */
const removeSong = async (id: number): Promise<any | null> => {
  const response = await fetch(`/user/song/remove/${id}`);

  apiUtils.checkLogged(response);

  return response.json();
};

/* eslint-disable no-undef */
export default {
  getUserData,
  saveSong,
  removeSong
};
