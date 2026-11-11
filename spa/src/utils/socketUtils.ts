import { WEBSOCKET_MAX_RETRIES } from '../config/config';

const RECONNECT_DELAYS_MS = [1000, 5000, 10000, 15000, 20000, 25000, 50000, 100000, 200000, 500000, 1000000, 2000000];

// a connection closed sooner than this after being opened counts as unstable
const UNSTABLE_CONNECTION_MS = 60000;

interface ReconnectBackoff {
  // to call in the socket onOpen callback
  onOpen: () => void,
  // the socket reconnectAfterMs option
  reconnectAfterMs: (tries: number) => number
}

/*
  phoenix.js resets its tries counter each time the connection opens, so a connection
  opening then being closed right away (flaky network, proxy, extension...) would be
  retried after the first delay forever, rejoining all its channels each time.
  The successive short-lived connections are counted to keep backing off in that case.

  Returning null from reconnectAfterMs does not stop phoenix.js retrying: the timer calls
  setTimeout(fn, null), i.e. reconnects immediately. So once the max retries is reached,
  giveUp is called (it should disconnect the socket, which cancels the scheduled reconnect).
  The next channel join of the user will connect the socket again.
*/
const createReconnectBackoff = (giveUp: () => void): ReconnectBackoff => {
  let lastOpenAt: number|null = null;
  let unstableConnections = 0;

  return {
    onOpen: () => {
      lastOpenAt = Date.now();
    },
    reconnectAfterMs: (tries: number) => {
      // first retry after a connection that was open: was it short-lived?
      if (tries === 1 && lastOpenAt !== null) {
        unstableConnections = Date.now() - lastOpenAt < UNSTABLE_CONNECTION_MS
          ? unstableConnections + 1 : 0;
        lastOpenAt = null;
      }

      const attempt = tries + unstableConnections;

      if (attempt >= WEBSOCKET_MAX_RETRIES) {
        unstableConnections = 0;
        // after phoenix.js scheduled the reconnect, so that disconnecting cancels it
        setTimeout(giveUp, 0);
      }

      return RECONNECT_DELAYS_MS[Math.min(attempt, RECONNECT_DELAYS_MS.length) - 1];
    }
  };
};

export default {
  createReconnectBackoff
};
