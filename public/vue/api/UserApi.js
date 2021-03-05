import axios from 'axios';

// ------------------------- API -------------------------

const getUserData = () => {
  const url = '/user';

  return axios.get(url)
    .then((response) => {
      if (response.data.user !== undefined) {
        return response.data.user;
      }

      return {};
    })
    .catch(() => {});
};

/* eslint-disable no-undef */
export default {
  getUserData
};
