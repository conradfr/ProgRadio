// Redirect to login page if response status is 403
const checkLogged = (response: Response) => {
  if (response.status === 403) {
    /* eslint-disable no-undef */
    // @ts-ignore defined on global scope
    window.location.href = `/${locale}/login`;
  }
};

export default {
  checkLogged,
};
