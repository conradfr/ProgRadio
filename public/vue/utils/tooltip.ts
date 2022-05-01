import {
  COOKIE_TOOLTIP_SHOW_MS
} from '@/config/config';

import cookies from './cookies';

const PLACEMENT = 'right';
const DELAY = 5000;

const set = (className: string, cookieName: string) => {
  /* eslint-disable no-undef */
  // @ts-expect-error logged is defined on the global scope
  if (cookies.has(cookieName) || logged === true) {
    return;
  }

  const elem = document.getElementsByClassName(className)[0];

  setTimeout(
    () => {
      /* eslint-disable no-undef */
      // @ts-expect-error boostrap is defined on the global scope
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
