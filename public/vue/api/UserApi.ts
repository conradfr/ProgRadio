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

/* eslint-disable no-undef */
export default {
  getUserData
};
