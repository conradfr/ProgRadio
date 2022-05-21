import {
  PLAYER_TYPE_RADIO,
  PLAYER_TYPE_STREAM
} from '@/config/config';

import type { Radio } from '@/types/radio';
import type { Stream } from '@/types/stream';

const isRadio = function isRadio(radioOrStream: Radio|Stream|null): radioOrStream is Radio {
  return radioOrStream !== null && (radioOrStream as Radio).type === PLAYER_TYPE_RADIO;
};

const isStream = function isStream(radioOrStream: Radio|Stream|null): radioOrStream is Stream {
  return radioOrStream !== null && (radioOrStream as Stream).type === PLAYER_TYPE_STREAM;
};

export default {
  isRadio,
  isStream
};
