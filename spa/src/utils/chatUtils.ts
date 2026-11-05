import cookies from '@/utils/cookies';

import {
  COOKIE_CHAT_NAME,
  CHAT_NAME_MAX_LENGTH
} from '@/config/config';

// the api only accepts stream ids (uuid) as chat topics, not radio / sub radio code names
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isChatStreamId = (streamId: string | null | undefined): streamId is string => (
  typeof streamId === 'string' && UUID_REGEX.test(streamId)
);

// encoded as the cookies util stores the raw value (a name can contain ";", spaces...)
const getSavedName = (): string | null => {
  const saved = cookies.get(COOKIE_CHAT_NAME);

  if (!saved) {
    return null;
  }

  try {
    const name = decodeURIComponent(saved).trim().slice(0, CHAT_NAME_MAX_LENGTH);
    return name !== '' ? name : null;
  } catch (_e) {
    return null;
  }
};

const saveName = (name: string) => {
  cookies.set(COOKIE_CHAT_NAME, encodeURIComponent(name));
};

const defaultName = () => `Anonymous${Math.floor(Math.random() * 1000)}`;

// removes the oldest items (in place, to keep the reactivity) when over the limit
const keepLast = <T>(list: T[], max: number) => {
  if (list.length > max) {
    list.splice(0, list.length - max);
  }
};

// message datetime is UTC (ISO 8601), displayed in the browser timezone
const formatTime = (datetime: string) => {
  const date = new Date(datetime);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default {
  isChatStreamId,
  getSavedName,
  saveName,
  defaultName,
  keepLast,
  formatTime
};
