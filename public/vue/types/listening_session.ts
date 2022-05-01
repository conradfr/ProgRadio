import type { DateTime } from 'luxon';

export interface ListeningSession {
  start: DateTime|null
  id: string|null
  ctrl: number|null
}
