// Redirect to login page if response status is 403
const checkLogged = (response: Response) => {
  if (response.status === 403) {
    // @ts-ignore defined on global scope
    // eslint-disable-next-line no-undef
    window.location.href = `/${locale}/login`;
  }
};

export default {
  checkLogged,
};
