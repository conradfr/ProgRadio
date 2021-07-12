import cookies from './cookies';

import {
  COOKIE_TOOLTIP_SHOW_MS
} from '../config/config';

const PLACEMENT = 'right';
const DELAY = 5000;

const set = (className, cookieName) => {
  /* eslint-disable no-undef */
  if (cookies.has(cookieName) === true || logged === true) {
    return;
  }

  const elem = document.getElementsByClassName(className)[0];

  setTimeout(
    () => {
      /* eslint-disable no-undef */
      const tooltip = new bootstrap.Tooltip(elem, {
        placement: PLACEMENT,
        boundary: document.body,
        fallbackPlacements: ['top', 'left', 'bottom']
      });

      tooltip.show();
      cookies.set(cookieName, true);

      setTimeout(
        () => {
          tooltip.dispose();
        },
        COOKIE_TOOLTIP_SHOW_MS
      );
    },
    DELAY
  );
};

export default {
  set
};
