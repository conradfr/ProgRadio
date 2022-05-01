import {
  THUMBNAIL_STREAM_PLACEHOLDER,
  THUMBNAIL_STREAM_PATH,
  THUMBNAIL_PAGE_PATH
} from '@/config/config';

import type { Radio } from '@/types/radio';
import type { Stream } from '@/types/stream';

const getPictureUrl = (radio: Radio|Stream) => {
  let img = THUMBNAIL_STREAM_PLACEHOLDER;

  // @ts-expect-error todo fix typeof
  if (radio !== null && radio.img_alt !== null) {
    // @ts-expect-error todo fix typeof
    img = `${THUMBNAIL_PAGE_PATH}${radio.img_alt}.png`;
  } else if (radio !== null && radio.img !== null && radio.img !== '') {
    img = `${THUMBNAIL_STREAM_PATH}${radio.img}`;
  }

  return img;
};

export default {
  getPictureUrl
};
