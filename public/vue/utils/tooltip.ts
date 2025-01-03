import {
  COOKIE_TOOLTIP_SHOW_MS
} from '@/config/config';

import cookies from './cookies';

const PLACEMENT = 'right';
const DELAY = 5000;

const set = (className: string, cookieName: string) => {
  // @ts-expect-error logged is defined on the global scope
  // eslint-disable-next-line no-undef
  if (cookies.has(cookieName) || logged === true) {
    return;
  }

  const elem = document.getElementsByClassName(className)[0];

  setTimeout(
    () => {
      // @ts-expect-error boostrap is defined on the global scope
      // eslint-disable-next-line no-undef
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
